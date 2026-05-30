pipeline {

agent any

environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
    DOCKERHUB_USERNAME = 'omkar1907'

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

    stage('Docker Compose Validation') {
        steps {
            sh '''
            docker compose up -d
            sleep 20
            docker compose ps
            docker compose down
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

    stage('Show Image Versions') {
        steps {
            sh '''
            echo "Backend Image: $DOCKERHUB_USERNAME/mern-backend:$IMAGE_TAG"
            echo "Frontend Image: $DOCKERHUB_USERNAME/mern-frontend:$IMAGE_TAG"
            '''
        }
    }

}
}