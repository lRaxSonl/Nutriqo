# Dark Theme & Color Palette

## Структура темизации

Приложение использует **темную тему по умолчанию** с поддержкой светлой темы через toggle. Управление темой осуществляется через `next-themes`.

## Цветовая палитра (CSS переменные)

### Основные цвета

```css
--background:              #0f1419  /* Основной фон */
--background-secondary:    #1a1f26  /* Вторичный фон (карточки) */
--foreground:              #e4e9f0  /* Основной текст */
--foreground-secondary:    #a8b1bb  /* Вторичный текст (подсказки) */
```

### Функциональные цвета

```css
--primary:                 #4a9eff  /* Основное действие (кнопки, ссылки) */
--primary-dark:            #2684d1  /* Hover-состояние primary */
--secondary:               #7c3aed  /* Дополнительное действие */
--destructive:             #ef4444  /* Опасное действие (удаление) */
--success:                 #22c55e  /* Успешная операция */
--warning:                 #f59e0b  /* Предупреждение */
--border:                  #2a3139  /* Границы элементов */
```

## Использование в компонентах

### TailwindCSS классы

```tsx
// Фоны
<div className="bg-background">...</div>
<div className="bg-background-secondary">...</div>

// Текст
<p className="text-foreground">...</p>
<p className="text-foreground-secondary">...</p>

// Цвета кнопок и аккентов
<button className="bg-primary text-white">...</button>
<button className="bg-destructive">...</button>
```

### CSS переменные (прямо)

```tsx
<div style={{ color: 'var(--primary)' }}>...</div>
```

## Компоненты и темизация

### Card
- Фон: `bg-background-secondary`
- Граница: `border-border`
- Текст: `text-foreground`

### Button
- **primary**: `bg-primary` → hover → `bg-primary-dark`
- **secondary**: `bg-background` + `border-border`
- **danger**: `bg-destructive`

### Input
- Фон: `bg-background`
- Граница: `border-border` → focus → `border-primary`
- Текст: `text-foreground`
- Плейсхолдер: `placeholder-foreground-secondary`

### ToastNotifications
- Success: Зелёный (#22c55e) на светло-зелёном фоне
- Error: Красный (#ef4444) на светло-красном фоне

## Светлая тема

При переключении на светлую тему (через toggle) все переменные CSS автоматически обновляются:

```css
.light {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #2684d1;
  /* и т.д. */
}
```

## Provider интеграция

ThemeProvider подключен в [src/app/providers.tsx](../app/providers.tsx):

```tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>
```

**Параметры:**
- `attribute="class"` — управление через class на `<html>`
- `defaultTheme="dark"` — тёмная тема по умолчанию
- `enableSystem` — respects системные настройки если нет сохранённого выбора

## Переключение темы в компонентах

```tsx
'use client';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

## Контраст и доступность

Цветовая палитра выбрана с учётом:
- ✅ WCAG AA контраст (минимум 4.5:1 для текста)
- ✅ Удобство в тёмной среде (низкая яркость)
- ✅ Различимость для пользователей с дальтонизмом

## Тестирование темы

```bash
# Проверить в браузере
# chrome://settings/appearance → Dark

# или в Next.js
# открыть DevTools → Rendering → Emulate CSS media feature prefers-color-scheme
```
