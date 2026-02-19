pipeline {
  agent any

  environment {
    DOCKERHUB_USERNAME = 'hahaha555'
    APP_NAME          = 'devops-delight-shop'
    IMAGE_TAG         = "${BUILD_NUMBER}"
  }

  tools {
    nodejs 'node-20-18-2'
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
        sh 'node -v'
        sh 'npm -v'
        sh 'npm ci || npm install'
      }
    }

    stage('Test + Coverage') {
      steps {
        sh 'npm run test:cov'
      }
    }

    stage('NPM Audit (non-blocking)') {
      steps {
        sh 'npm audit --audit-level=high || true'
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
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 15, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Docker Build & Push (main only)') {
      when {
        branch 'main'
      }
      steps {
        script {
          def fullImage = "${DOCKERHUB_USERNAME}/${APP_NAME}"

          docker.withRegistry('', 'docker-hub-creds') {
            def img = docker.build("${fullImage}:${IMAGE_TAG}")
            img.push()
            img.push('latest')
          }
        }
      }
    }
  }
}

