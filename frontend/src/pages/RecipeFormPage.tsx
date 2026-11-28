import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { LIMITS, type Recipe, type RecipeInput } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { useDictionary } from '@/hooks/useDictionary';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Banner } from '@/ui/Banner';
import { Icon } from '@/ui/Icon';
import { PhotoPicker } from '@/ui/PhotoPicker';
import { IngredientPicker } from '@/ui/IngredientPicker';
import '@/ui/ui.css';
import './RecipeFormPage.css';

const MAX_DESC = 3000;
type Step = { uid: number; description: string; photo_key: string | null };
let uid = 1;

function Select({ label, value, onChange, children, error }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode; error?: string }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label">{label}</label>
      <div className="field__box"><select className="field__input" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select><Icon name="chevronDown" size={18} /></div>
      {error && <p className="field__error"><Icon name="alert" size={14} />{error}</p>}
    </div>
  );
}

function Form({ initial, editId }: { initial?: Recipe; editId?: number }) {
  const nav = useNavigate(); const qc = useQueryClient();
  const cuisines = useDictionary('cuisines'), times = useDictionary('cook-time-ranges'), diets = useDictionary('diet-tags'), cats = useDictionary('dish-categories'), ings = useDictionary('ingredients');
  const [title, setTitle] = useState(initial?.title ?? ''); const [photo, setPhoto] = useState(initial?.photo_key ?? null);
  const [cat, setCat] = useState(String(initial?.dish_categories[0] ?? '')); const [cuisine, setCuisine] = useState(String(initial?.cuisine_id ?? ''));
  const [time, setTime] = useState(String(initial?.cook_time_range_id ?? '')); const [servings, setServings] = useState(String(initial?.servings ?? ''));
  const [dtags, setDtags] = useState<number[]>(initial?.diet_tags ?? []); const [ingr, setIngr] = useState<number[]>(initial?.ingredients ?? []);
  const [term, setTerm] = useState('');
  const [steps, setSteps] = useState<Step[]>(initial?.recipe_steps.map((s) => ({ uid: uid++, description: s.description, photo_key: s.photo_key })) ?? [{ uid: uid++, description: '', photo_key: null }]);
  const [errs, setErrs] = useState<Record<string, string>>({}); const [formErr, setFormErr] = useState<string | null>(null);

  const sugg = useMemo(() => term.trim() ? ings.items.filter((i) => i.name.toLowerCase().includes(term.trim().toLowerCase()) && !ingr.includes(i.id)).slice(0, 6) : [], [term, ings.items, ingr]);
  const save = useMutation({
    mutationFn: (b: RecipeInput) => (editId ? recipesApi.update(editId, b) : recipesApi.create(b)),
    onSuccess: (r) => { qc.invalidateQueries(); nav(`/recipes/${r.id}`, { replace: true }); },
    onError: (e) => setFormErr(e instanceof ApiError && e.status === 409 ? 'Лимит достигнут: у автора может быть не больше 1000 рецептов.' : 'Не удалось сохранить рецепт. Проверьте данные и повторите.'),
  });

  function submit() {
    const e: Record<string, string> = {}; const t = title.trim(); const sv = Number(servings);
    if (t.length < 3 || t.length > 150) e.title = 'Название: от 3 до 150 символов.';
    if (!time) e.time = 'Выберите время приготовления.';
    if (!Number.isInteger(sv) || sv < 1 || sv > 1000) e.servings = 'Порции: целое число от 1 до 1000.';
    if (ingr.length < 1) e.ingr = 'Добавьте хотя бы один ингредиент (до 30).';
    if (steps.some((s) => !s.description.trim())) e.steps = 'Заполните описание каждого шага или удалите лишний.';
    setErrs(e); setFormErr(null);
    if (Object.keys(e).length) { setFormErr('Исправьте ошибки в форме, они отмечены красным.'); return; }
    save.mutate({ title: t, ingredients: ingr, photo_key: photo, diet_tags: dtags, dish_categories: cat ? [Number(cat)] : [], cuisine_id: cuisine ? Number(cuisine) : null,
      cook_time_range_id: Number(time), servings: sv, recipe_steps: steps.map((s, i) => ({ step_no: i + 1, description: s.description.trim(), photo_key: s.photo_key })) });
  }
  const upd = (u: number, p: Partial<Step>) => setSteps((a) => a.map((s) => (s.uid === u ? { ...s, ...p } : s)));
  const tgl = (a: number[], id: number) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);

  return (
    <div className="rf">
      <h1 className="t-h1">{editId ? 'Редактирование рецепта' : 'Новый рецепт'}</h1>
      {formErr && <Banner kind="error">{formErr}</Banner>}
      <div className="rf__cols">
        <div className="rf__col">
          <Field label="Название (3–150 символов)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} error={errs.title} placeholder="Сливочная курица с грибами" />
          <div><p className="field__label" style={{ marginBottom: 6 }}>Фото готового блюда</p><PhotoPicker value={photo} onChange={setPhoto} label="Загрузить фото" /></div>
          <Select label="Категория" value={cat} onChange={setCat}><option value="">Не выбрано</option>{cats.items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select>
          <Select label="Тип кухни" value={cuisine} onChange={setCuisine}><option value="">Не выбрано</option>{cuisines.items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select>
          <Select label="Время приготовления" value={time} onChange={setTime} error={errs.time}><option value="">Выберите</option>{times.items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select>
          <Field label="Количество порций (до 1000)" inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value.replace(/\D/g, ''))} error={errs.servings} maxLength={4} />
          <div><p className="field__label" style={{ marginBottom: 6 }}>Особенности питания</p>
            <div className="rf__chips">{diets.items.map((i) => <button type="button" key={i.id} className="chip" aria-pressed={dtags.includes(i.id)} onClick={() => setDtags(tgl(dtags, i.id))}>{i.name}</button>)}</div></div>
          <div className="rf__card">
            <h2 className="t-title">Ингредиенты ({ingr.length} из {LIMITS.ingredientsPerRecipe})</h2>
            <IngredientPicker value={ingr} onChange={setIngr} max={LIMITS.ingredientsPerRecipe} error={errs.ingr} />
          </div>
        </div>

        <div className="rf__col">
          <h2 className="t-h3">Приготовление <span className="t-caption">(до {LIMITS.stepsPerRecipe} шагов)</span></h2>
          {errs.steps && <p className="field__error"><Icon name="alert" size={14} />{errs.steps}</p>}
          {steps.map((s, i) => (
            <div key={s.uid} className="rf__card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="t-title">Шаг {i + 1}</h3>
                {steps.length > 1 && <button type="button" aria-label={`Удалить шаг ${i + 1}`} onClick={() => setSteps(steps.filter((x) => x.uid !== s.uid))}><Icon name="trash" size={18} /></button>}
              </div>
              <PhotoPicker value={s.photo_key} onChange={(k) => upd(s.uid, { photo_key: k })} label="Добавить фото шага" tone="lilac" ratio="3/2" />
              <textarea className="rf__ta" aria-label={`Описание шага ${i + 1}`} value={s.description} maxLength={MAX_DESC} placeholder={`Описание шага (до ${MAX_DESC} символов)`} onChange={(e) => upd(s.uid, { description: e.target.value })} />
            </div>
          ))}
          <Button variant="outline" size="lg" block disabled={steps.length >= LIMITS.stepsPerRecipe} onClick={() => setSteps([...steps, { uid: uid++, description: '', photo_key: null }])}><Icon name="plus" size={18} />Добавить шаг</Button>
        </div>
      </div>
      <div className="rf__actions">
        <Button variant="accent" size="lg" disabled={save.isPending} onClick={submit}>{save.isPending ? 'Сохраняем…' : editId ? 'Сохранить' : 'Опубликовать'}</Button>
        <Button variant="outline" size="lg" onClick={() => nav(-1)}>Отмена</Button>
      </div>
    </div>
  );
}

export default function RecipeFormPage() {
  const id = Number(useParams().id) || undefined; const { user } = useAuth();
  const q = useQuery({ queryKey: ['recipe', id], queryFn: () => recipesApi.get(id!), enabled: !!id, retry: false });
  if (!id) return <Form />;
  if (q.isLoading) return <div className="skeleton" style={{ height: 400 }} />;
  if (q.isError || !q.data) return <div style={{ display: 'grid', gap: 12 }}><Banner kind="error">Рецепт не найден.</Banner><Link to="/"><Button variant="outline">В ленту</Button></Link></div>;
  if (q.data.author_id !== user?.id) return <Banner kind="error">Редактировать рецепт может только его автор.</Banner>;
  return <Form key={id} initial={q.data} editId={id} />;
}
