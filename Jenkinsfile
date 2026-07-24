pipeline {

    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    environment {

        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_USERNAME = 'omkar1907'

        GITHUB_TOKEN = credentials('github-access token')
        GITHUB_USERNAME = 'Om65234'

        IMAGE_TAG = "v${BUILD_NUMBER}"

        REACT_APP_BACKEND_URL = '/api/tasks'
    }

    stages {

        stage('Build Backend Docker Image') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USERNAME/mern-backend:$IMAGE_TAG ./backend
                '''
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh '''
                docker build \
                --build-arg REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL \
                -t $DOCKERHUB_USERNAME/mern-frontend:$IMAGE_TAG \
                ./frontend
                '''
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh '''
                trivy fs --severity HIGH,CRITICAL .
                '''
            }
        }

        stage('OWASP Dependency-Check Scan') {
            steps {
                dependencyCheck(
                    odcInstallation: 'OWASP-Dependency-Check',
                    nvdCredentialsId: 'nvd-api-key',
                    additionalArguments: '''
                        --scan ./backend
                        --scan ./frontend
                        --disableYarnAudit
                        --disableNodeAudit
                    '''
                )

                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }

        stage('SonarQube Analysis') {

            environment {
                scannerHome = tool 'sonar-scanner'
            }

            steps {

                withSonarQubeEnv('sonarqube') {

                    sh """
                    ${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=mern-devsecops \
                    -Dsonar.projectName=mern-devsecops \
                    -Dsonar.sources=.
                    """
                }
            }
        }

        stage('Trivy Backend Image Scan') {
            steps {
                sh '''
                trivy image --severity HIGH,CRITICAL \
                $DOCKERHUB_USERNAME/mern-backend:$IMAGE_TAG
                '''
            }
        }

        stage('Trivy Frontend Image Scan') {
            steps {
                sh '''
                trivy image --severity HIGH,CRITICAL \
                $DOCKERHUB_USERNAME/mern-frontend:$IMAGE_TAG
                '''
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
                sh '''
                docker push $DOCKERHUB_USERNAME/mern-backend:$IMAGE_TAG
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                docker push $DOCKERHUB_USERNAME/mern-frontend:$IMAGE_TAG
                '''
            }
        }

        stage('Clone Manifest Repository') {
            steps {
                sh """
                rm -rf manifests

                git clone https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/Om65234/End-to-End-k8s-manifests.git manifests
                """
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                sh """
                sed -i "s|image: omkar1907/mern-frontend:.*|image: omkar1907/mern-frontend:${IMAGE_TAG}|" manifests/frontend/frontend-deployment.yaml

                sed -i "s|image: omkar1907/mern-backend:.*|image: omkar1907/mern-backend:${IMAGE_TAG}|" manifests/backend/backend-deployment.yaml
                """
            }
        }

        stage('Push Updated Manifest Repo') {
            steps {

                dir('manifests') {

                    sh """
                    git config user.email "jenkins@example.com"
                    git config user.name "Jenkins"

                    git add .

                    git commit -m "Updated image tag to ${IMAGE_TAG}" || true

                    git push https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/Om65234/End-to-End-k8s-manifests.git main
                    """
                }
            }
        }
    }

    post {
        success {
            echo "========================================"
            echo " Pipeline SUCCEEDED - Image: $IMAGE_TAG "
            echo "========================================"
        }

        failure {
            echo "========================================"
            echo " Pipeline FAILED - Check logs above "
            echo "========================================"
        }

        always {
            sh 'docker image prune -f || true'
            cleanWs()
        }
    }
}