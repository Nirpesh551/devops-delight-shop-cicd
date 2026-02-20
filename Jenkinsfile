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

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo "Installing dependencies..."
        sh '''
          set -euxo pipefail
          node -v
          npm -v
          npm ci
        '''
      }
    }

    stage('Test + Coverage') {
      steps {
        sh '''
          set -euxo pipefail
          npm run test:cov
          test -f coverage/lcov.info
          ls -lah coverage/lcov.info
        '''
      }
    }

    stage('NPM Audit (non-blocking)') {
      steps {
        sh '''
          set +e
          npm audit --audit-level=high
          exit 0
        '''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          def scannerHome = tool 'sonar-scanner'

          withSonarQubeEnv('SonarQube') {
            sh """
              set -euxo pipefail

              ${scannerHome}/bin/sonar-scanner \
                -Dsonar.projectKey=devops-delight-shop \
                -Dsonar.projectName=devops-delight-shop \
                -Dsonar.sources=src \
                -Dsonar.tests=src/test,__tests__ \
                -Dsonar.test.inclusions=**/*.test.tsx,**/*.test.ts,**/*.test.js \
                -Dsonar.exclusions=src/test/**,__tests__/** \
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                -Dsonar.coverage.exclusions=src/main.tsx,**/*.config.js,**/*.config.ts,src/components/ui/**,src/integrations/**
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

  post {
    always {
      echo "Build completed: ${currentBuild.currentResult}"
      archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
    }
  }
}
