# Инструкции по отладке кнопок переключения режимов

## Проблема
UIManager не доступен при инициализации, из-за чего кнопки переключения режимов не работают.

## Добавленные исправления

### 1. Расширенная отладка
- Добавлена детальная отладочная информация при инициализации компонентов
- Проверка доступности всех классов при загрузке DOM

### 2. Fallback функциональность
- Если UIManager недоступен, используется резервная реализация `setViewModeFallback`
- Прямое управление CSS классами и кнопками

### 3. Тестовые страницы
- `debug-classes.html` - проверка доступности всех классов
- `view-test.html` - изолированное тестирование кнопок

## Как тестировать

### Шаг 1: Проверка классов
1. Откройте `http://localhost:8000/debug-classes.html`
2. Проверьте, что все классы помечены как "✅ Доступен"
3. Если UIManager показывает "❌ Недоступен", значит проблема в порядке загрузки

### Шаг 2: Основное приложение
1. Откройте `http://localhost:8000`
2. Откройте консоль браузера (F12)
3. Найдите секцию "=== DOM LOADED - CHECKING CLASSES ==="
4. Проверьте, что UIManager показывает "function"

### Шаг 3: Тестирование кнопок
1. Нажмите на кнопки "Разделенный", "Редактор", "Превью"
2. В консоли должны появиться сообщения:
   - Если UIManager работает: "Calling UIManager.setViewMode with: ..."
   - Если используется fallback: "Using fallback setViewMode for: ..."

## Ожидаемые результаты

### Если UIManager работает:
```
UIManager available, initializing...
UIManager initialized successfully
MarkdownEditor.setViewMode called with: editor
Calling UIManager.setViewMode with: editor
UIManager.setViewMode called with: editor
```

### Если используется fallback:
```
UIManager not available! This will cause view mode buttons to not work.
MarkdownEditor.setViewMode called with: editor
UIManager not available for setViewMode, using fallback
Using fallback setViewMode for: editor
Fallback: Added class: view-editor
```

## Что проверить в любом случае

1. **Панели переключаются**: При нажатии кнопок панели должны скрываться/показываться
2. **Кнопки подсвечиваются**: Активная кнопка должна иметь класс "active"
3. **CSS классы применяются**: Контейнер должен получать классы view-split/view-editor/view-preview

## Если проблема остается

### Проверьте консоль на:
1. Ошибки JavaScript при загрузке
2. Сообщение "UIManager not available!"
3. Ошибки при создании экземпляров классов

### Возможные причины:
1. **Порядок загрузки**: UIManager определяется после MarkdownEditor
2. **Синтаксические ошибки**: Препятствуют загрузке классов
3. **Проблемы с экспортом**: window.UIManager не устанавливается

### Быстрое решение:
Если fallback работает (панели переключаются), то проблема решена, даже если UIManager недоступен.

## Файлы для проверки
- `http://localhost:8000` - основное приложение
- `http://localhost:8000/debug-classes.html` - проверка классов
- `http://localhost:8000/view-test.html` - тест кнопок