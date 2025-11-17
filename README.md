
### 📋 Guia: Como Rodar o projeto `mercado-souto-mobile`

Este guia assume que você está em um computador que já tem o ambiente de desenvolvimento configurado.

### 1\. ⚙️ Pré-requisitos (O que você precisa ter)

Antes de tudo, garanta que você tem estas três coisas instaladas:

1.  **Node.js:** Essencial para rodar o Expo. (Versão LTS é recomendada).
2.  **Git:** O programa para "clonar" (baixar) seu projeto do GitHub.
3.  **Expo Go (App no Celular):** Se você quiser testar no seu celular (iOS ou Android), baixe o app "Expo Go" na sua loja de aplicativos.

-----

### 2\. ▶️ Passo a Passo para Rodar o Projeto

Siga estes comandos no seu terminal.

#### Passo 1: Abrir o Terminal e Navegar

Abra seu terminal e navegue até a pasta onde você guarda seus projetos (como `Documentos/Git`, por exemplo).

```bash
# Exemplo: navegando para a pasta 'Git' dentro de 'Documentos'
cd ~/Documentos/Git
```

#### Passo 2: Clonar o Projeto do GitHub (O Novo Passo)

Este comando vai baixar uma cópia exata do seu projeto do GitHub para o seu computador.

**Substitua `[URL_DO_SEU_REPO_NO_GITHUB]`** pela URL do seu repositório. (Você pega ela no botão verde "Code" lá no GitHub).

```bash
git clone [URL_DO_SEU_REPO_NO_GITHUB] mercado-souto-app
```

  * O comando `git clone` baixa o projeto.
  * `mercado-souto-app` é o nome que a pasta terá no seu computador.

#### Passo 3: Entrar na Pasta do Projeto

Agora que o projeto foi baixado, entre na pasta que acabamos de criar:

```bash
cd mercado-souto-app
```

#### Passo 4: Instalar as Dependências (Muito Importante)

Você **precisa** instalar todas as "peças" (pacotes) que o projeto usa.

```bash
npm install
```

*(Este comando lê o `package.json` e baixa tudo o que está listado ali, como o Expo, React, Tailwind, etc.)*

#### Passo 5: Iniciar o Servidor do Expo

Este é o comando principal. Ele "liga" o seu app.

**Recomendação:** Use sempre a versão com `-c` (clear cache). Nossos problemas de layout "bugado" são quase sempre por causa de cache.

```bash
npx expo start -c
```

-----

### 3\. 📱 Escolher Onde Rodar

Depois do Passo 5, seu terminal vai mudar e mostrar um **QR Code** e várias opções:

```
› Metro waiting on...
› Starting Metro Bundler
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press s │ stop server
...
[QR CODE AQUI]
```

Agora você escolhe:

#### ⌨️ Para Rodar na Web (O que estávamos fazendo)

  * No terminal, aperte a tecla **`w`**.
  * Isso vai abrir o app automaticamente no seu navegador, no endereço `http://localhost:8081` (ou similar).

#### 🤳 Para Rodar no Celular (Android)

1.  Abra o app **Expo Go** no seu celular.
2.  Na tela principal do app, toque em "Scan QR Code".
3.  Aponte a câmera do celular para o QR Code que está no seu terminal.
4.  O app vai carregar no seu celular.

#### 🤳 Para Rodar no Celular (iOS - iPhone)

1.  Abra o app de **Câmera** normal do seu iPhone.
2.  Aponte a câmera para o QR Code no seu terminal.
3.  Um pop-up "Abrir no Expo Go" vai aparecer. Toque nele.
4.  O app vai carregar no seu celular.

-----

### ⚠️ Solução de Problemas Comuns

  * **"Meu layout está todo bugado\!"**
      * **Causa:** 99% das vezes é cache.
      * **Solução:** Pare o servidor (`Ctrl + C`) e rode de novo com `npx expo start -c`.
  * **"Apertei F5 na web e tudo quebrou\!"**
      * **Causa:** O servidor do Expo não lida bem com refresh (F5) em telas que não são a principal.
      * **Solução:** Para testar, sempre volte para a tela inicial (`http://localhost:8081/`) e navegue pelo app usando os botões, em vez de dar F5.
  * **"Não achou o módulo 'react-native-safe-area-context' (ou outro)"**
      * **Causa:** Você pulou o Passo 4 (`npm install`).
      * **Solução:** Pare o servidor (`Ctrl + C`) e rode `npm install`.
