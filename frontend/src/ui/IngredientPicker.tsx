import { useState } from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { Icon } from './Icon';
import { Banner } from './Banner';

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');
/** Выбор ингредиентов из справочника. Список открывается по фокусу, ищет по подстроке и по началу слова («курица» → «Куриное филе»). */
export function IngredientPicker({ value, onChange, max, error }: { value: number[]; onChange: (v: number[]) => void; max: number; error?: string }) {
  const d = useDictionary('ingredients'); const [term, setTerm] = useState(''); const [open, setOpen] = useState(false);
  const t = norm(term.trim()); const stem = t.slice(0, Math.max(3, t.length - 2));
  const list = d.items.filter((i) => !value.includes(i.id) && (!t || norm(i.name).includes(t) || norm(i.name).split(/\s+/).some((w) => w.startsWith(stem)))).slice(0, 8);
  const full = value.length >= max;
  const add = (id: number) => { if (!full) onChange([...value, id]); setTerm(''); };
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {value.map((id) => <div key={id} className="rf__row">{d.byId.get(id) ?? `#${id}`}
        <button type="button" aria-label={`Убрать ${d.byId.get(id) ?? id}`} onClick={() => onChange(value.filter((x) => x !== id))}><Icon name="close" size={16} /></button></div>)}
      {d.isError && <Banner kind="error">Не удалось загрузить список ингредиентов. Обновите страницу.</Banner>}
      <div className={`field ${error ? 'field--error' : ''}`}>
        <label className="field__label" htmlFor="ing-input">Добавить ингредиент</label>
        <div className="field__box"><input id="ing-input" className="field__input" value={term} autoComplete="off" disabled={full}
          placeholder={full ? `Максимум ${max} ингредиентов` : 'Выберите из списка или начните вводить'}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (list[0]) add(list[0].id); } }} /></div>
        {error && <p className="field__error"><Icon name="alert" size={14} />{error}</p>}
      </div>
      {open && !full && !d.isLoading && (
        <div role="listbox" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--line)', borderRadius: 16, background: 'var(--white)', overflow: 'hidden' }}>
          {list.length ? list.map((i) => <button key={i.id} type="button" role="option" aria-selected="false" onMouseDown={(e) => e.preventDefault()} onClick={() => add(i.id)}
            style={{ textAlign: 'left', padding: '10px 16px', minHeight: 44, font: '500 14px var(--font)' }}>{i.name}</button>)
            : <p className="t-caption" style={{ padding: '12px 16px' }}>{d.items.length ? 'Такого ингредиента нет в справочнике. Попробуйте другое название.' : 'Справочник ингредиентов пуст.'}</p>}
        </div>)}
    </div>
  );
}
