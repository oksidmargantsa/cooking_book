from functools import lru_cache
from urllib.parse import quote, urlsplit

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.core.config import Settings, get_settings
from app.core.constants import UPLOAD_MAX_BYTES, UPLOAD_URL_TTL_SECONDS


class StorageClient:
    def __init__(self, settings: Settings):
        self.bucket = settings.minio_bucket
        self.public_base_url = settings.minio_public_base_url.rstrip("/")
        options = {
            "aws_access_key_id": settings.minio_access_key,
            "aws_secret_access_key": settings.minio_secret_key,
            "region_name": "us-east-1",
            "config": Config(
                signature_version="s3v4",
                s3={"addressing_style": "path"},
                connect_timeout=3,
                read_timeout=10,
                retries={"total_max_attempts": 2},
            ),
        }
        self.client = boto3.client("s3", endpoint_url=settings.minio_endpoint, **options)
        self.signer = (
            boto3.client("s3", endpoint_url=settings.minio_signing_endpoint, **options)
            if settings.minio_signing_endpoint
            else self.client
        )

    def public_url(self, key: str) -> str:
        return f"{self.public_base_url}/{quote(key)}"

    def presign(self, key: str, content_type: str) -> str:
        signed_url = self.signer.generate_presigned_url(
            "put_object",
            Params={"Bucket": self.bucket, "Key": key, "ContentType": content_type},
            ExpiresIn=UPLOAD_URL_TTL_SECONDS,
            HttpMethod="PUT",
        )
        return f"{self.public_url(key)}?{urlsplit(signed_url).query}"

    @staticmethod
    def _is_missing(error: ClientError) -> bool:
        return error.response["Error"]["Code"] in {"404", "NoSuchKey", "NotFound"}

    def exists(self, key: str) -> bool:
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
        except ClientError as error:
            if self._is_missing(error):
                return False
            raise
        return True

    def read_temp(self, key: str) -> bytes | None:
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
        except ClientError as error:
            if self._is_missing(error):
                return None
            raise
        stream = response["Body"]
        try:
            if not 1 <= response["ContentLength"] <= UPLOAD_MAX_BYTES:
                raise ValueError("Размер фото должен быть больше нуля и не превышать 10 МБ")
            data = stream.read(UPLOAD_MAX_BYTES + 1)
            if not 1 <= len(data) <= UPLOAD_MAX_BYTES:
                raise ValueError("Размер фото должен быть больше нуля и не превышать 10 МБ")
            return data
        finally:
            stream.close()

    def put_jpeg(self, key: str, data: bytes) -> None:
        self.client.put_object(Bucket=self.bucket, Key=key, Body=data, ContentType="image/jpeg")

    def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)


@lru_cache
def get_storage() -> StorageClient:
    return StorageClient(get_settings())
