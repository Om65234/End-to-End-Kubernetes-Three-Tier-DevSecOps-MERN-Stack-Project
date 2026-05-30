pipeline {

agent any

environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
    DOCKERHUB_USERNAME = 'omkar1907'

    GITHUB_TOKEN = credentials('github-access token')
    GITHUB_USERNAME = 'Om65234'

    IMAGE_TAG = "v${BUILD_NUMBER}"

    MANIFEST_REPO = "https://github.com/Om65234/End-to-End-k8s-manifests.git"
}

stages {

    stage('Build Backend Docker Image') {
        steps {
            sh 'docker build -t $DOCKERHUB_USERNAME/mern-backend:$IMAGE_TAG ./backend'
        }
    }

    stage('Build Frontend Docker Image') {
        steps {
            sh 'docker build -t $DOCKERHUB_USERNAME/mern-frontend:$IMAGE_TAG ./frontend'
        }
    }

    stage('Docker Login') {
        steps {
            sh '''
            echo $DOCKERHUB_CREDENTIALS_PSW | docker login \
            -u $DOCKERHUB_CREDENTIALS_USR \
            --password-stdin
            '''
        }
    }

    stage('Docker Compose Validation') {
        steps {
            sh '''
            docker-compose up -d

            sleep 20

            docker-compose ps

            docker-compose down
            '''
        }
    }

    stage('Push Backend Image') {
        steps {
            sh 'docker push $DOCKERHUB_USERNAME/mern-backend:$IMAGE_TAG'
        }
    }

    stage('Push Frontend Image') {
        steps {
            sh 'docker push $DOCKERHUB_USERNAME/mern-frontend:$IMAGE_TAG'
        }
    }

    stage('Clone Manifest Repository') {
        steps {
            sh '''
            rm -rf manifests

            git clone https://$GITHUB_USERNAME:${GITHUB_TOKEN_PSW}@github.com/Om65234/End-to-End-k8s-manifests.git manifests
            '''
        }
    }

    stage('Update Kubernetes Manifests') {
        steps {
            sh '''
            sed -i "s|image: omkar1907/mern-frontend:.*|image: omkar1907/mern-frontend:$IMAGE_TAG|" manifests/frontend/frontend-deployment.yaml

            sed -i "s|image: omkar1907/mern-backend:.*|image: omkar1907/mern-backend:$IMAGE_TAG|" manifests/backend/backend-deployment.yaml
            '''
        }
    }

    stage('Push Updated Manifest Repo') {
        steps {
            dir('manifests') {
                sh '''
                git config user.email "jenkins@example.com"
                git config user.name "Jenkins"

                git add .

                git commit -m "Updated image tag to $IMAGE_TAG"

                git push https://$GITHUB_USERNAME:${GITHUB_TOKEN_PSW}@github.com/Om65234/End-to-End-k8s-manifests.git main
                '''
            }
        }
    }

}

}
