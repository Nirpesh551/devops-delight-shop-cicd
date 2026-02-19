pipeline {
    agent any
    tools {
        nodejs 'node-20-18-2'   
        dependencyCheck = tool 'OWASP-DepCheck'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Install') {
            steps {
                echo "Installing dependencies..."
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=devops-delight-shop \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://100.114.119.71:9000
                        """
                    }
                }
            }
        }

        stage('OWASP Dependency Check') {
          steps {
            dependencyCheck additionalArguments: '--scan . --format HTML --format XML', odcInstallation: 'OWASP-DepCheck'
            dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
          }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}

