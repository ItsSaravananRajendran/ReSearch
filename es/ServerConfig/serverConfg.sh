adduser user && usermod -aG sudo user &&  vim /etc/ssh/sshd_config
systemctl restart sshd

sudo apt update && 
sudo apt -y upgrade && 
sudo apt install python3-pip  build-essential libssl-dev libffi-dev python3-dev unzip&&
pip3 install jupyter 


curl -O https://download.java.net/java/GA/jdk11/9/GPL/openjdk-11.0.2_linux-x64_bin.tar.gz && 
tar -zxvf openjdk-11.0.2_linux-x64_bin.tar.gz &&
sudo update-alternatives --install /usr/bin/java java /home/user/jdk-11.0.2/bin/java 1 &&
sudo update-alternatives --set java /home/user/jdk-11.0.2/bin/java
export JAVA_HOME="/home/user/jdk-11.0.2"

jupyter notebook --no-browser --port=8889
ssh -N -f -L localhost:8888:localhost:8889 username@your_remote_host_name


git clone https://thunderb01t@bitbucket.org/thunderb01t/biobert.git
unzip biobert/bert-pubmed-model.zip 
mkdir ./sentence_wise_email/
mkdir ./sentence_wise_email/module/
mkdir ./sentence_wise_email/module/module_useT
curl -L "https://tfhub.dev/google/universal-sentence-encoder-large/3?tf-hub-format=compressed" | tar -zxvC ./sentence_wise_email/module/module_useT

