 pipeline {

    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_USERNAME = 'omkar1907'

        GITHUB_TOKEN = credentials('github-access token')
        GITHUB_USERNAME = 'Om65234'

        IMAGE_TAG = "v${BUILD_NUMBER}"
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

        stage('Update Kubernetes Manifests') {
            steps {
                sh """
                sed -i 's|image: omkar1907/mern-frontend:.*|image: omkar1907/mern-frontend:$IMAGE_TAG|' k8s/frontend/frontend-deployment.yaml

                sed -i 's|image: omkar1907/mern-backend:.*|image: omkar1907/mern-backend:$IMAGE_TAG|' k8s/backend/backend-deployment.yaml
                """
            }
        }

        stage('Push Updated Manifest To GitHub') {
            steps {
                sh """
                git config --global user.email "jenkins@example.com"
                git config --global user.name "Jenkins"

                git add k8s/frontend/frontend-deployment.yaml
                git add k8s/backend/backend-deployment.yaml

                git commit -m "Updated image tag to $IMAGE_TAG" || true

                git push https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/Om65234/End-to-End-Kubernetes-Three-Tier-DevSecOps-MERN-Stack-Project.git HEAD:main
                """
            }
        }

    }
}

