FROM node:20-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Paket dosyalarını kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Next.js projesini production için derle
RUN npm run build

# Uygulamanın çalışacağı port
EXPOSE 3000

# Projeyi başlat
CMD ["npm", "run", "start"]
