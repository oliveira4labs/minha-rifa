# Sistema de Rifas

Site para criar rifas, compartilhar o link, confirmar pagamentos e sortear.

## Como rodar

Precisa apenas do Node.js 22.13 ou mais novo (não há dependências para instalar).

```bash
node server.js
```

Abra http://localhost:3000. Para usar outra porta: `PORT=8080 node server.js`.

## Onde ficam os dados

Tudo fica na pasta `data/`: o banco (`rifas.db`) e as fotos (`uploads/`).
Faça cópia dessa pasta para ter backup. Apagar a pasta zera o sistema.

## Regras

- Qualquer pessoa cria uma conta e vira administradora das rifas que criar.
- Comprador não precisa de conta: abre o link, escolhe os números, informa nome e WhatsApp.
- Número reservado fica **pendente** pelo tempo definido na rifa. Nesse prazo ninguém mais consegue pegá-lo.
  Sem confirmação até o fim do prazo, ele volta a ficar disponível sozinho.
- O comprador vê a chave PIX e um botão para enviar o comprovante pelo WhatsApp do administrador.
- O administrador confirma (ou recusa) cada reserva no painel. Também pode desfazer uma venda já confirmada.
- Limite de números por pessoa é opcional, por rifa (controlado pelo WhatsApp informado).
- Sorteio: liberado quando todos os números estão pagos **ou** quando chega a data do sorteio.
  Na data, se a rifa não estiver completa, o administrador pode adiar a data ou sortear só entre os pagos.
  Sempre há uma confirmação antes, e o sorteio não pode ser desfeito.
- Na página pública aparecem só nomes abreviados ("Maria S."); o WhatsApp dos compradores só o administrador vê.

## Publicar na internet

Para outras pessoas abrirem o link, o site precisa estar em um servidor com Node.js
(Railway, Render, Fly.io, VPS…) com **disco persistente** para a pasta `data/`
(defina `DATA_DIR` apontando para o disco) e HTTPS.
