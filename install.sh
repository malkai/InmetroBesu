#!/bin/sh

set -e  # Faz o script parar em caso de erro

echo "📌 Atualizando pacotes..."
sudo apt update -y && sudo apt upgrade -y

# Instala Git e Curl
echo "📌 Instalando Git e Curl..."
sudo apt install -y git curl

# Instala Docker
echo "📌 Adicionando repositório do Docker..."
sudo apt install -y ca-certificates software-properties-common
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "📌 Adicionando Docker ao sources.list..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update -y
echo "📌 Instalando Docker..."
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adiciona usuário ao grupo docker
echo "📌 Configurando permissões do Docker..."
sudo groupadd docker || true  # Evita erro se o grupo já existir
sudo usermod -aG docker $USER

# Instala Helm
echo "📌 Instalando Helm..."
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod +x get_helm.sh
./get_helm.sh
rm get_helm.sh  # Remove script após instalação

# Instala Kubectl
echo "📌 Instalando Kubectl..."
sudo snap install kubectl --classic

# Instala Minikube e dependências
echo "📌 Instalando dependências do Minikube..."
sudo apt install -y conntrack socat

echo "📌 Instalando Minikube..."
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64  # Remove o arquivo após instalação

# Instala Node.js e NPM
echo "📌 Instalando Node.js e NPM..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Copiar Repositorio da Rede
echo "📌 Copiando o Repositorio da Rede Besu..."
sudo git clone https://github.com/malkai/InmetroBesu

# Mensagem final
echo "✅ Todos os aplicativos foram instalados com sucesso!"
echo "ℹ️ Para usar o Docker sem sudo, faça logout e login novamente."

exit 0
