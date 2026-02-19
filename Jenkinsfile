pipeline {
  agent any

  tools {
    scannerHome = tool 'sonar-scanner'
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
        withSonarQubeEnv('SonarQube') {
          sh "${scannerHome}/bin/sonar-scanner \
          -Dsonar.projectKey=devops-delight-shop \
          -Dsonar.sources=. \
          -Dsonar.host.url=http://100.114.119.71:9000"
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

  }
}
