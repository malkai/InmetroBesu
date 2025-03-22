# Introdução

Este é um tutorial simples para a criação de uma rede Besu privada utilizando Kubernetes. Diferentemente do Docker Compose, que apenas monta a rede sem considerar o consumo de CPU, o Kubernetes permite controlar os recursos de processamento utilizados. Essa configuração é especialmente interessante para implantações em serviços de nuvem.

# Tecnologias necessárias
```bash
git

curl

docker

helm

kubectl

minikube
```

# Script de instalação em máquinas ubuntu
```bash
sudo chmod +x install.sh
sudo ./install.sh
```

# Iniciar o Cluster utilizando o minikube

```bash

minikube start --memory 16384 --cpus 6 --cni auto


```
Verifique se o kubectl está conectado ao Minikube com: (use a versão mais recente do kubectl)

```bash
$ kubectl version
```


# Monitorar o rede Besus
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# utilizado para moniturar a rede
helm install monitoring prometheus-community/kube-prometheus-stack --version 34.10.0 --namespace quorum --create-namespace --values ./values/monitoring.yml --wait

# Aplicar os valores
kubectl --namespace quorum apply -f  ./values/monitoring/
```


# Arquivos para a montagem da rede
```bash
#A instalação do bloco Gênesis nesta rede possui uma diferença em relação à rede utilizada no tutorial. Aqui, é utilizado o **quorum-genesis-tool**, localizado em genesis-job-init.yaml, na linha 112.
helm install genesis ./charts/besu-genesis --namespace quorum --create-namespace --values ./values/genesis-besu.yml

# Bootnodes são nós especiais em uma rede blockchain que ajudam novos nós a se conectarem à rede. Eles funcionam como pontos de entrada iniciais, fornecendo uma lista de outros nós ativos para que um novo nó possa estabelecer conexões com a rede. (OBS: sem eles a rede demora a levantar)
helm install bootnode-1 ./charts/besu-node --namespace quorum --values ./values/bootnode.yml

# !! IMPORTANTE !! - Se você usar bootnodes, defina quorumFlags.usesBootnodes: true nos arquivos YAML de substituição (override).

# All 4 validators must be started for the blocks to be produced.
helm install validator-1 ./charts/besu-node --namespace quorum --values ./values/validator.yml
helm install validator-2 ./charts/besu-node --namespace quorum --values ./values/validator.yml
helm install validator-3 ./charts/besu-node --namespace quorum --values ./values/validator.yml
helm install validator-4 ./charts/besu-node --namespace quorum --values ./values/validator.yml

# crie um nó quorum rpc
helm install rpc-1 ./charts/besu-node --namespace quorum --values ./values/reader.yml

#Para fins de testes inicias abrir a porta 8545 com o comando

kubectl port-forward service/quorum-explorer 80:80  -n quorum &
kubectl port-forward service/besu-node-rpc-1 8545:8545  -n quorum 
```

# Comandos para verificar os nós
```bash
# utilizado para deleter um serviço (obs : Algumas vezes melhor reiniciar o minikube)
kubectl delete service #names -n quorum

# pega status e info dos serviços em deployment
kubectl get deployment -n quorum

# pega status e info dos serviços em service
kubectl get service -n quorum
  
# pega os pods e info 
kubectl get pods -n quorum
```

# Deploy do contrato 

```bash
cd smart_contracts

npm i

cd deploy_contracts 

node hre_public_tx.js 

```

# Caso deseje compilar os contratos

```bash
cd smart_contracts


cd deploy_contracts 


node compile.js 

#colocar os contratos na pasta contracts
```

# Comandos adicionais

Não são necessários para o funcionamento da rede 

## Ferramentas para verificar a saúde do cluster (opcional )

```bash

minikube addons enable ingress

minikube dashboard &

helm repo add elastic https://helm.elastic.co

helm repo update

 helm install elasticsearch --version 8.5.1  elastic/elasticsearch --namespace quorum --create-namespace --values ./values/elasticsearch.yml --set replicas=1 --set minimumMasterNodes=1 


 helm install kibana --version 8.5.1 elastic/kibana --namespace quorum --values ./values/kibana.yml

 helm install filebeat --version 8.5.1 elastic/filebeat  --namespace quorum --values ./values/filebeat.yml
```

acessar caso o cluster para a configuração

minikube service kibana-expose -n quorum

a senha encotra-se no cluster, então é necessario entrar no cluster através do dashboard. 

criar um indexidor no elastic com o comando abaixo

filebeat-* 

## Arquivos para explorar os blocos criados pela rede  (opcional )
```bash
 

# Explorador de Blockchain para inspecionar, analisar e interagir com cadeias EVM, rollups otimistas e zk-rollups.
helm install blockscout ./charts/blockscout --namespace quorum --create-namespace --values ./values/blockscout-besu.yml

# Quorum-Explorer é um explorador de blockchain leve. O Quorum Explorer não é recomendado para uso em produção e destina-se apenas a fins de demonstração/desenvolvimento.
helm install quorum-explorer ./charts/explorer --namespace quorum --create-namespace  --values ./values/explorer-besu.yaml
```
