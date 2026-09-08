# Minhas Finanças — versão mobile local

Esta edição mantém receitas, despesas, categorias, limites mensais, painel, backups JSON e exportação CSV. Não usa Firebase nem envia os registros para um servidor. Cada aparelho tem seus próprios dados.

## Instalar

É necessário disponibilizar os arquivos deste app em um endereço HTTPS para a instalação pelo navegador. Abrir ou enviar apenas o HTML não instala o aplicativo.

1. Publique juntos `index.html`, `mobile.css`, `device.js`, `sw.js`, `manifest.webmanifest`, `icon-192.png` e `icon-512.png` em uma mesma pasta do GitHub Pages (pode ser a pasta `mobile`). O arquivo `build-mobile.cjs` não precisa ser publicado.
2. Abra o endereço no celular, com internet, e aguarde a mensagem “Pronto para usar sem internet” na aba Dados.
3. Android: no Chrome, toque em “Instalar no celular” quando disponível ou use o menu → Instalar aplicativo / Adicionar à tela inicial.
4. iPhone: no Safari, Compartilhar → Adicionar à Tela de Início. Se aparecer “Abrir como App”, deixe ativado.
5. Abra pelo ícone criado na tela inicial. Os próximos usos podem ser sem internet.

A hospedagem distribui apenas o aplicativo. As informações financeiras permanecem no aparelho. Esta entrega é uma aplicação instalável pelo navegador (PWA), não um APK nem um aplicativo de loja.

## Guardar e transferir os dados

Na aba Dados, use Backup (.json) regularmente e guarde o arquivo. Limpar os dados do navegador ou do app pode apagar os registros. O sistema também pode remover armazenamento local em algumas situações; instalação não substitui backup.

Para levar os dados da versão 2.0 para o celular, exporte o backup nela e importe nesta versão. A importação substitui os registros após confirmação. Instale primeiro e importe pelo ícone da tela inicial, pois o navegador e o app instalado podem ter áreas de armazenamento diferentes. A edição mobile usa uma chave própria de armazenamento e não altera os dados da versão anterior.

## Atualizações

Mantenha o mesmo endereço para preservar acesso aos dados. Ao atualizar arquivos, altere a versão de CACHE em sw.js. A nova versão entra após fechar as janelas antigas e reabrir o app.

Fontes: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable e https://support.apple.com/en-gb/guide/iphone/iphea86e5236/ios
