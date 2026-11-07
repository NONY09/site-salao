# Glow Carioca

Site de apresentação do salão, com 31 serviços e pedido de marcação pelo WhatsApp da Karen: **+351 912 162 550**.

## Publicar do GitHub para o Netlify

1. No Netlify, escolha **Add new project → Import an existing project → GitHub**.
2. Selecione o repositório **NONY09/site-salao**: https://github.com/NONY09/site-salao
3. Use a branch **main**.
4. Deixe **Base directory** e **Build command** vazios. Em **Publish directory**, use **dist**.
5. Publique. O `netlify.toml` já define a pasta correta.

Não precisa de instalar pacotes, configurar variáveis de ambiente ou criar uma base de dados. Os ficheiros já estão prontos. Depois de ligar o repositório, os próximos commits na branch de produção atualizam o site no Netlify.

A pasta `dist` e o ficheiro `netlify.toml` ficam na raiz deste repositório, prontos para a importação pelo Netlify.

Documentação: https://docs.netlify.com/build/configure-builds/overview/

## Abrir antes de publicar

Abra `dist/index.html` no navegador. Mantenha `app.js`, `services.js`, `styles.css` e a pasta `assets` nos seus locais. O site funciona também sem um servidor local; o WhatsApp, Instagram e mapa precisam de internet.

## O que está incluído

- Identidade em dourado, creme e verde escuro, com logótipo e fotos reais do salão.
- Página adaptada a computador e telemóvel, com apresentação, espaço, galeria, horários e morada.
- Catálogo com categorias, pesquisa que aceita palavras sem acentos, preços em euros e duração.
- Seleção de vários serviços, remoção e resumo do total.
- Tratamento de valores fixos, valores “a partir de” e serviços sob consulta.
- Nome, data e período preferidos opcionais.
- Mensagem preparada para o WhatsApp da Karen. A cliente envia a mensagem e a equipa confirma a marcação.
- Fotografias e fontes incluídas localmente, sem dependência de imagens remotas no carregamento.

## Alterações simples

| O que alterar | Ficheiro |
| --- | --- |
| Nome, preço, duração e descrição de um serviço | `dist/services.js` |
| Textos, horários, morada, links e fotografias | `dist/index.html` |
| Cores, tamanhos e disposição visual | `dist/styles.css` |
| Número e texto gerado para marcação | `dist/app.js` |

Em `services.js`, `price: 30` significa 30 €, `from: true` acrescenta “a partir de”, `price: null` significa “sob consulta” e `minutes` é a duração em minutos. Não altere os identificadores `id` ao mudar apenas o preço.

O número também aparece nos links diretos de `index.html`. Atualize esses links se mudar de contacto. A seleção e os campos não são guardados depois de recarregar a página.

## Pontos a confirmar com a Karen

- **Corte com finalização:** o preço não é visível no print. Está “sob consulta”, sem inventar um valor ou somá-lo como gratuito.
- **Alongamento F1:** foi mantido **30 €**, como no print enviado. A página pública da Fresha consultada mostrava 32 €.
- **Terapia capilar · tratamento:** o print indica **0 €** e a página pública também o apresenta sem custo. O site preserva 0 € e indica que as condições devem ser confirmadas com o salão. É um serviço distinto do pacote de terapia capilar a partir de 155 €.
- A morada e o horário vieram da página pública do salão. O telefone usado é exclusivamente o número fornecido nesta conversa, mesmo havendo outro na Fresha.

Consulte `docs/FONTES_E_PRECOS.md` para o registo completo do catálogo e das fontes.

## Verificação realizada

Verificação visual em Chromium, no computador e em largura de telemóvel (375 px úteis), sem deslocamento horizontal. Testados os filtros, pesquisa sem acentos, adição, remoção, seleção vazia, preço sob consulta, galeria ampliada, menu móvel e bloqueio de datas passadas.

O conjunto 25 € + 60 € + 15 € + 5,50 € apresentou corretamente **105,50 €**, com indicação “a partir de”. A mensagem gerada preservou o destinatário, serviços, preços, duração, nome e preferência de data/horário. Nenhuma mensagem foi enviada durante os testes. O envio final depende do WhatsApp da visitante e da confirmação do salão.

Código disponível neste repositório, preparado para a publicação no Netlify. A configuração da hospedagem é feita ao importar o repositório.
