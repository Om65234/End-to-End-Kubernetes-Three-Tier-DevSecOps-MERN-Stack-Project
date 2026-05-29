pipeline {

    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_USERNAME = 'omkar1907'
    }

    stages {

        stage('Clone Repository') {
            steps {
                git 'YOUR_GITHUB_REPO_URL'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USERNAME/mern-backend:latest ./backend'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USERNAME/mern-frontend:latest ./frontend'
            }
        }

        stage('Docker Login') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push Backend Image') {
            steps {
                sh 'docker push $DOCKERHUB_USERNAME/mern-backend:latest'
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh 'docker push $DOCKERHUB_USERNAME/mern-frontend:latest'
            }
        }

        stage('Show Docker Images') {
            steps {
                sh 'docker images'
            }
        }

    }
}

