# Guia para Rodar a Aplicação Completa (Back + Front)

Este README explica como executar todo o projeto localmente, garantindo que o aplicativo mobile consiga acessar a API corretamente usando o IP da sua máquina.

---

## 1. Obter o IP da Máquina
Para que o app consiga se comunicar com a API, é necessário usar o **IP local** da sua máquina.

### **Windows**
Abra o CMD e rode:
```bash
ipconfig
```
Procure pelo campo **Endereço IPv4**.

### **Linux**
Execute:
```bash
hostname -I
```
ou
```bash
ip addr show
```
O IP geralmente aparece como algo do tipo:
```
192.168.x.x
```

---

## 2. Configurar o Front-end (Expo)
Com o IP encontrado (exemplo: `192.168.8.4`), edite o arquivo `.env.local` dentro do projeto front-end:

```
EXPO_PUBLIC_API_URL=http://192.168.8.4:3000/anotacoes/api/v1
```

⚠ **Importante:** Certifique-se de que o celular ou emulador está na mesma rede Wi-Fi que o computador.

---

## 3. Rodar o Back-end
Dentro da pasta do servidor, execute:
```bash
npm install
npm install -g nodemon
npm run dev
```
O back ficará disponível em:
```
http://SEU_IP_AQUI:3000
```

---

## 4. Rodar o Front-end (Expo)
No projeto mobile:
```bash
npm install
npx expo start -c
```
Use o QR Code ou abra no emulador.

---

## 5. Testar a API Pelo Navegador
Para verificar se o back está rodando corretamente, acesse:

```
http://SEU_IP_AQUI:3000/ping
```
Se tudo estiver certo, deve aparecer:
```
pong
```

---

## 6. Tudo Pronto!
Agora o front e o back estarão rodando juntos, usando o IP da sua máquina para comunicação local.