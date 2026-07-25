# Demian — Primeira Edição | Teste Técnico Frontend H&W Publishing

🚀 Fluxo de vendas de um exemplar raro de colecionador: a primeira edição em português de *Demian*, de Hermann Hesse.

## 📋 Sobre o Projeto

Teste técnico frontend que simula uma jornada de compra em 3 etapas:

1. **Landing Page (LP)** - Página de vendas do exemplar
2. **Página Pós-Venda/Upsell** - Oferta complementar (*Companheiro de Colecionador*) revelada após o vídeo
3. **Página de Agradecimento** - Confirmação do pedido com próximos passos de envio

## 🛠️ Tecnologias

### Obrigatório
- HTML5
- CSS3 (CSS puro com variáveis)
- JavaScript puro (Vanilla JS)
- TDD com Vitest

### Utilitários
- **Build**: Rsbuild (camada oficial sobre Rspack)
- **Animações**: GSAP
- **Testes**: Vitest + Testing Library
- **Fontes**: Unbounded + Liter (self-hosted via fonts.css)

### Características Técnicas
- ✅ Funções puras e nomeadas (sem anonymous functions)
- ✅ Early return sempre
- ✅ Linha em branco após declarar variáveis
- ✅ Aliases de caminho (sem `../`): `@core`, `@pages`, `@locales`, `@css`
- ✅ Pattern Pub/Sub para desacoplamento
- ✅ Event-driven architecture
- ✅ Mobile-first
- ✅ i18n (pt-BR / en-US) carregada como módulos
- ✅ CSS com variáveis, sem inline styles

## 📁 Estrutura do Projeto

```
hw-publishing-frontend-test-2026-07-24/
├── public/
│   ├── images/
│   └── videos/
├── src/
│   ├── css/
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   ├── typography.css
│   │   │   ├── utilities.css
│   │   │   └── variables.css
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles.css
│   ├── js/
│   │   ├── core/
│   │   │   ├── i18n.js
│   │   │   ├── pubsub.js
│   │   │   └── utils.js
│   │   └── pages/
│   │       ├── index.js
│   │       ├── upsell.js
│   │       └── thank-you.js
│   └── locales/
│       ├── en-US.json
│       └── pt-BR.json
├── tests/
│   ├── integration/
│   ├── unit/
│   ├── helpers.js
│   └── setup.js
├── pages/
│   ├── index.html
│   ├── upsell.html
│   └── thank-you.html
├── jsconfig.json
├── package.json
├── rsbuild.config.js
├── vitest.config.js
└── README.md
```

## 🚀 Como Executar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

### Build Produção
```bash
npm run build
```

### Testes
```bash
# Rodar testes
npm test

# Com cobertura
npm run test:coverage

# Interface visual
npm run test:ui
```

### Preview
```bash
npm run preview
```

## 📱 Responsividade

O projeto é otimizado para:
- 📱 **Mobile**: < 768px
- 📱 **Tablet**: 768px - 1023px  
- 💻 **Desktop**: ≥ 1024px

## 🌐 Internacionalização

O projeto suporta dois idiomas:
- 🇧🇷 Português (pt-BR) - padrão
- 🇺🇸 Inglês (en-US)

Troca automática baseada no navegador do usuário.

## ⚡ Performance

### Lighthouse Scores (Target)
- **Performance**: >90
- **Accessibility**: >90
- **Best Practices**: >90
- **SEO**: >90

### Otimizações
- Lazy loading de imagens
- Code splitting
- Tree shaking
- Minificação CSS/JS
- Fontes otimizadas

## 🧪 Testes

### Cobertura
Target: ≥80% em código crítico

### Estrutura
```
tests/
├── unit/         # Testes unitários
├── integration/  # Testes de integração
└── setup.js      # Configuração testes
```

## 📦 Deploy

O projeto está configurado para deploy em:
- **Vercel** (recomendado)
- Netlify
- GitHub Pages

## ✅ Critérios de Sucesso

- [x] HTML semântico
- [x] CSS sem inline styles
- [x] JavaScript com funções puras e nomeadas
- [x] Responsividade (Mobile/Tablet/Desktop)
- [x] Performance (Lighthouse >90)
- [x] Testes TDD (RED, GREEN, REFACTOR)
- [x] Deploy funcional

## 🔧 Configuração de Desenvolvimento

### VS Code
Recomendados extensions:
- ESLint
- Prettier
- Vitest
- Live Server

### Git Hooks (Opcional)
```bash
npm install -g husky
npx husky install
```

## 📞 Contato

Desenvolvido para teste técnico da H&W Publishing.

## 📄 Licença

MIT