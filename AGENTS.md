# AGENTS.md - Especificações Técnicas do Projeto

## 🎯 Contexto
Case Técnico Frontend para H&W Publishing - Fluxo de vendas de 3 páginas para produto digital.

---

## 📐 Arquitetura JavaScript

### Padrões e Princípios
- **Pattern**: Pub/Sub (Publish-Subscribe) para desacoplamento
- **Funções**: Sempre funções puras (pure functions)
- **Nomenclatura**: Nunca usar funções anônimas - todas nomeadas
- **Controle de Fluxo**: Early return sempre
- **Formatação**: Sempre deixar uma linha em branco após declarar variáveis (const/let/var)
- **Imports**: Usar aliases de caminho - nunca usar `../` (apenas `./mesmo-arquivo` é permitido)
- **Arquitetura**: Event-driven
- **Testes**: TDD estrito (RED, GREEN, REFACTOR) com Vitest

### Bibliotecas Permitidas
- **Animações**: GSAP (permitido)
- **Build/Bundling**: Rsbuild (camada oficial sobre Rspack, https://rspack.rs/) para compressão de source
- **Testes**: Vitest + Testing Library

### Aliases de Caminho
Definidos em `jsconfig.json`, `rsbuild.config.js` (`source.alias`) e `vitest.config.js` (`resolve.alias`):

| Alias | Caminho |
|---|---|
| `@core` | `src/js/core` |
| `@features` | `src/js/features` |
| `@pages` | `src/js/pages` |
| `@locales` | `src/locales` |
| `@css` | `src/css` |

### Regras de Código
```javascript
// ✅ CORRETO - early return, linha em branco após declarar variável, função nomeada
function handleUserClick(event) {
  if (!event) return;

  const user = getUserData();

  if (!user) return;

  processUser(user);
}

// ❌ ERRADO - sem linha em branco após declarar variável
function detectLocale() {
  const stored = localStorage.getItem('preferred-locale');
  if (stored) return stored; // falta linha em branco acima
}

// ❌ ERRADO - função anônima e caminho relativo ../
element.addEventListener('click', (event) => {});
import I18n from '../core/i18n.js';
```

---

## 🎨 CSS

### Tecnologia e Ferramentas
- **Tecnologia**: CSS puro (sem preprocessors)
- **Fonte**: Montserrat (Google Fonts)
- **Abordagem**: Mobile-first
- **Organização**: Sempre em ordem alfabética
- **Tema**: Variáveis CSS custom properties

### Regras de Estilo
```css
/* ✅ CORRETO - Variáveis, Mobile-first, Ordem alfabética */
:root {
  --color-black: #000000;
  --color-primary: #3b82f6;
  --color-white: #ffffff;
}

.component {
  align-items: center;
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .component {
    flex-direction: row;
  }
}

/* ❌ ERRADO - Inline styles */
<div style="display: flex;">...</div>
```

### Entry de CSS
- `src/css/styles.css` importa os arquivos base (variables, reset, typography) e componentes
- Cada página importa seu CSS no JS: `import '@css/styles.css'` (+ CSS específico da página)
- CSS local entre arquivos via `@import` é processado pelo bundler (inlineado no build) — OK
- Fontes do Google carregam via `<link>` no HTML (com `preconnect`) — **nunca** via `@import url()` no CSS (bloqueia render)

### Classes utilitárias para JS
- `is-hidden` (`display: none`) para mostrar/ocultar elementos sem inline style
- Toda a apresentação (cor, posição, tamanho) vem de classes, nunca de `element.style.<propriedade>`
- **Única exceção**: valores puramente dinâmicos (scroll %, posição/cor aleatória de partículas) podem ser passados via CSS custom properties com `element.style.setProperty('--nome', valor)`, com a regra visual correspondente definida em uma classe (ex.: `.scroll-progress { width: var(--scroll-progress) }`)

### Compatibilidade
- Sempre usar features com maior compatibilidade cross-device
- Testar em múltiplos browsers e dispositivos
- Considerar progressive enhancement

---

## 🌐 Internacionalização (i18n)

### Estrutura de Locales
```json
// locales/pt-BR.json
{
  "landing": {
    "hero": {
      "title": "Transforme sua Carreira",
      "subtitle": "O curso completo de desenvolvimento web"
    },
    "cta": {
      "buy": "Comprar Agora",
      "upsell": "Aproveite Oferta Especial"
    }
  }
}

// locales/en-US.json
{
  "landing": {
    "hero": {
      "title": "Transform Your Career",
      "subtitle": "The complete web development course"
    },
    "cta": {
      "buy": "Buy Now",
      "upsell": "Get Special Offer"
    }
  }
}
```

### Implementação
- Detectar locale do navegador ou usar seleção manual
- Importar os JSON como módulos (`import ptBR from '@locales/pt-BR.json'`) — nunca via `fetch('/src/...')`, que quebra em produção após o bundle
- Fallback para pt-BR como padrão
- Armazenar preferência no localStorage

---

## 🧪 Testes (TDD)

### Fluxo de Trabalho
1. **RED**: Escrever teste falhando
2. **GREEN**: Fazer teste passar (implementação mínima)
3. **REFACTOR**: Melhorar código mantendo testes passando

### Cobertura e Tipos
- Testes de funcionalidades core
- Testes de componentes visuais
- Testes de i18n
- Testes de performance
- Mínimo 80% de cobertura em código crítico

---

## 📁 Estrutura de Projeto

```
hw-publishing-frontend-test-2026-07-24/
├── public/
│   ├── images/
│   └── videos/
├── src/
│   ├── js/
│   │   ├── core/
│   │   │   ├── i18n.js
│   │   │   ├── pubsub.js
│   │   │   └── utils.js
│   │   ├── features/
│   │   │   ├── landing/
│   │   │   ├── upsell/
│   │   │   └── thank-you/
│   │   └── pages/
│   │       ├── landing.js
│   │       ├── upsell.js
│   │       └── thank-you.js
│   ├── css/
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   ├── typography.css
│   │   │   └── variables.css
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles.css
│   └── locales/
│       ├── en-US.json
│       └── pt-BR.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.js
├── pages/
│   ├── landing.html
│   ├── upsell.html
│   └── thank-you.html
├── jsconfig.json
├── rsbuild.config.js
├── vitest.config.js
├── package.json
└── README.md
```

---

## 🚀 Build e Deploy

### Rsbuild Configuration
- Cada entry em `source.entry` gera seu próprio HTML via `html.templateByEntry`
- Minificação e code-split nativos (Rspack por baixo)
- Source maps em desenvolvimento
- Aliases em `source.alias` espelhando `jsconfig.json`

### Deploy
- **Plataforma**: Vercel (recomendado)
- **Performance**: Lighthouse scores >90
- **Evidências**: Screenshots no README

---

## ✅ Critérios de Sucesso

### Responsividade (CRÍTICO)
- Excelente adaptação: Mobile, Tablet, Desktop
- Layout consistente across devices
- Hierarquia visual adequada
- Navegação fluida

### Performance (OBRIGATÓRIO)
- Lighthouse scores >90
- Carregamento eficiente
- Imagens otimizadas
- Performance consistente em mobile

### Código
- HTML semântico
- CSS sem inline styles
- JS com funções puras e nomeadas
- Testes TDD

---

## 🎨 Produto

**Primeira edição em português de *Demian* (Hermann Hesse)** — exemplar raro de colecionador.
- Landing Page: venda do exemplar (autenticidade, conservação, Nobel 1946)
- Upsell: oferta complementar — *Companheiro de Colecionador* (guia anotado + slipcase + ex-libris), revelada após o vídeo
- Thank You: confirmação do pedido com resumo (livro + companheiro) e próximos passos de envio

Marca/loja: **H&W Publishing** (curadoria de edições raras).

---

## 📝 Notas Importantes

- Design é livre - foco em qualidade técnica
- Não é necessário backend
- Foco principal: domínio de frontend base, responsividade e performance
- Criatividade e capricho visual são valorizados
- Autonomia na tomada de decisões técnicas