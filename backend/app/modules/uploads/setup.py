import json
from time import sleep

from botocore.exceptions import ClientError, ConnectionError

from app.core.constants import UPLOAD_SETUP_ATTEMPTS, UPLOAD_SETUP_RETRY_SECONDS
from app.modules.uploads.storage import get_storage


def setup() -> None:
    storage = get_storage()
    client, bucket = storage.client, storage.bucket
    for attempt in range(UPLOAD_SETUP_ATTEMPTS):
        try:
            client.head_bucket(Bucket=bucket)
            break
        except ClientError as error:
            if error.response["Error"]["Code"] not in {"404", "NoSuchBucket", "NotFound"}:
                raise
            client.create_bucket(Bucket=bucket)
            break
        except ConnectionError:
            if attempt == UPLOAD_SETUP_ATTEMPTS - 1:
                raise
            sleep(UPLOAD_SETUP_RETRY_SECONDS)

    client.put_bucket_policy(
        Bucket=bucket,
        Policy=json.dumps(
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket}/photos/*",
                    }
                ],
            }
        ),
    )


if __name__ == "__main__":
    setup()
