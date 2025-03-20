# Introdução

Este é um tutorial simples para a criação de uma rede Besu privada utilizando Kubernetes. Diferentemente do Docker Compose, que apenas monta a rede sem considerar o consumo de CPU, o Kubernetes permite controlar os recursos de processamento utilizados. Essa configuração é especialmente interessante para implantações em serviços de nuvem.

# Tecnologias necessárias
```bash
sudo apt install git -y
sudo apt install curl

# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

sudo snap install kubectl --classic

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

sudo install minikube-linux-amd64 /usr/local/bin/minikube



```

# Iniciar o Cluster utilizando o minikube

```bash

minikube start --memory 16384 --cpus 6 --cni auto

minikube addons enable storage-provisioner

minikube addons enable ingress

minikube dashboard &
```
Verify kubectl is connected to Minikube with: (please use the latest version of kubectl)

```bash
$ kubectl version
```


# Ferramentas para verificar a saúde do cluster (opcional )

```bash
# não são necessários para o funcionamento da rede 

 helm install elasticsearch --version 8.5.1  elastic/elasticsearch --namespace quorum --create-namespace --values ./values/elasticsearch.yml --set replicas=1 --set minimumMasterNodes=1 


 helm install kibana --version 8.5.1 elastic/kibana --namespace quorum --values ./values/kibana.yml

 helm install filebeat --version 8.5.1 elastic/filebeat  --namespace quorum --values ./values/filebeat.yml
```

acessar caso o cluster para a configuração

minikube service kibana-expose -n quorum

a senha encotra-se no cluster, então é necessario entrar no cluster através do dashboard. 

criar um indexidor no elastic com o comando abaixo

filebeat-* 

# Monitorar o rede Besus

```bash
# utilizado para moniturar a rede
helm install monitoring prometheus-community/kube-prometheus-stack --version 34.10.0 --namespace quorum --create-namespace --values ./values/monitoring.yml --wait

# Aplicar os valores
kubectl --namespace quorum apply -f  ./values/monitoring/
```


# Ngix em construção não utilizar ainda

```
helm install quorum-monitoring-ingress ingress-nginx/ingress-nginx     --namespace quorum     --set controller.ingressClassResource.name="monitoring-nginx"     --set controller.ingressClassResource.controllerValue="k8s.io/monitoring-ingress-nginx"     --set controller.replicaCount=1     --set controller.nodeSelector."kubernetes\.io/os"=linux     --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux     --set controller.admissionWebhooks.patch.nodeSelector."kubernetes\.io/os"=linux     --set controller.service.externalTrafficPolicy=Local     --set controller.config.allow-snippet-annotations="true"     --set controller.config.annotations-risk-level="Critical"
```

# Arquivos para a montagem da rede
```bash
# Explorador de Blockchain para inspecionar, analisar e interagir com cadeias EVM, rollups otimistas e zk-rollups.
helm install blockscout ./charts/blockscout --namespace quorum --create-namespace --values ./values/blockscout-besu.yml

# Quorum-Explorer é um explorador de blockchain leve. O Quorum Explorer não é recomendado para uso em produção e destina-se apenas a fins de demonstração/desenvolvimento.
helm install quorum-explorer ./charts/explorer --namespace quorum --create-namespace  --values ./values/explorer-besu.yaml

#A instalação do bloco Gênesis nesta rede possui uma diferença em relação à rede utilizada no tutorial. Aqui, é utilizado o **quorum-genesis-tool**, localizado em genesis-job-init.yaml, na linha 112.
helm install genesis ./charts/besu-genesis --namespace quorum --create-namespace --values ./values/genesis-besu.yml

# Bootnodes são nós especiais em uma rede blockchain que ajudam novos nós a se conectarem à rede. Eles funcionam como pontos de entrada iniciais, fornecendo uma lista de outros nós ativos para que um novo nó possa estabelecer conexões com a rede. (OBS: sem eles a rede demora a levantar)
helm install bootnode-1 ./charts/besu-node --namespace quorum --values ./values/bootnode.yml

helm install bootnode-2 ./charts/besu-node --namespace quorum --values ./values/bootnode.yml

# !! IMPORTANTE !! - Se você usar bootnodes, defina quorumFlags.usesBootnodes: true nos arquivos YAML de substituição (override).


# All 4 validators must be started for the blocks to be produced.
helm install validator-1 ./charts/besu-node --namespace quorum --values ./values/validator.yml
helm install validator-2 ./charts/besu-node --namespace quorum --values ./values/validator.yml
helm install validator-3 ./charts/besu-node --namespace quorum --values ./values/validator.yml
helm install validator-4 ./charts/besu-node --namespace quorum --values ./values/validator.yml

# spin up a besu and tessera node pair
helm install member-1 ./charts/besu-node --namespace quorum --values ./values/txnode.yml
helm install rpc-1 ./charts/besu-node --namespace quorum --values ./values/reader.yml

# spin up a quorum rpc node
helm install rpc-1 ./charts/besu-node --namespace quorum --values ./values/reader.yml

#Para fins de testes inicias abrir a porta 8545 com o comando
kubectl port-forward service/besu-node-rpc-1 8545:8545  -n quorum &
```

# Comandos para verificar os nós
```bash
# utilizado para deleter um serviço (obs : Algumas vezes melhor reiniciar o minikube)
kubectl delete service #names -n quorum

# pega status e info dos serviços em deployment
kubectl get deployment -n quorum

# pega status e info dos serviços em service
kubectl get service -n quorum

```

