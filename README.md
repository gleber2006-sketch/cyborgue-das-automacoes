# Cyborgue das Automações — site interativo

Site em HTML, CSS e JavaScript puro, sem frameworks e sem build. O vídeo fornecido foi dividido em **120 frames WebP** (12 quadros por segundo), com versões distintas para desktop e celular. O áudio original foi preservado no MP4 incluído.

## Como abrir

1. Extraia **todo o ZIP**, mantendo as pastas `assets/frames/desktop` e `assets/frames/mobile`.
2. Abra `index.html` em um navegador moderno. Para testar comportamento semelhante ao de hospedagem, execute um servidor HTTP local. Por exemplo: `python -m http.server 8000` dentro da pasta, então abra `http://localhost:8000`.
3. Role a primeira seção da página para abrir, revelar e fechar a máscara. Use **Ver com som** para assistir ao MP4 com seu áudio original sincronizado.

## Áudio e scrolling

O efeito do scroll mostra os frames conforme a posição da página e funciona também ao rolar para trás. **Não é tecnicamente confiável manter a trilha sonora contínua sincronizada à rolagem**, porque o visitante pode parar ou inverter a reprodução a qualquer momento e navegadores bloqueiam som automático sem interação. Por isso o botão **Ver com som** abre o vídeo original com controles nativos e áudio íntegro. A visualização em scroll é silenciosa.

## Antes de publicar — contato

Em `script.js`, no topo, configure um dos destinos:

```js
const CONTACT = {
  whatsapp: '5515999999999', // exemplo de FORMATO; substitua pelo telefone verdadeiro
  email: ''
};
```

Ou use apenas `email: 'voce@seu-dominio.com.br'`, com um endereço verdadeiro.

**Importante:** sem um destino válido, o formulário apenas oferece cópia do briefing e **não envia** mensagens. Não há backend nem banco de dados, e o exemplo de telefone acima não deve ser publicado como um contato real.

## Hospedagem

Pode ser publicado como site estático em Cloudflare Pages, Vercel, GitHub Pages ou Nginx na sua VPS. Envie toda a pasta, mantendo as referências relativas. O HTTPS é recomendado para acesso a recursos modernos do navegador. Vídeos e imagens são arquivos locais, não dependem de plataformas externas. A fonte do Google Fonts usa internet, com fallback para fontes locais.

## Organização

- `index.html` — estrutura, conteúdo e SEO.
- `styles.css` — visual futurista e responsividade.
- `script.js` — pré-carregamento de frames, canvas, scrolling, modal de áudio, menu e formulário.
- `assets/frames/desktop` — 120 frames em WebP 1120×630.
- `assets/frames/mobile` — 120 frames em WebP 704×396.
- `assets/cena-original-com-audio.mp4` — vídeo original intacto, inclusive áudio.
- `assets/hero-poster.webp` — imagem de fallback enquanto os frames carregam.

## Design e desempenho

- Preload completo de 120 frames com indicador circular de progresso, antes da experiência.
- O canvas desenha um frame por vez, com suavização de avanço e suporte à rolagem reversa.
- Áudio somente mediante clique explícito.
- Navegação com menu para celulares, links-âncora, formulário validado e tratamento de falhas do carregamento.
- `prefers-reduced-motion` respeitado.
- Não há deploy automático e não é necessário build.
