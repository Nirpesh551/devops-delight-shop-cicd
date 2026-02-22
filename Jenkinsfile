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

    stage('OWASP Dependency-Check') {
      steps {
        withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {
          dependencyCheck additionalArguments: "--nvdApiKey ${NVD_API_KEY} --scan ./ --format HTML --format XML", odcInstallation: 'OWASP-DepCheck'
        }
        dependencyCheckPublisher pattern: 'dependency-check-report.xml'
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

    stage('Container Image Scan (Trivy)') {
      steps {
        script {
          echo "Initiating Trivy vulnerability scanner..."
          
          withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', passwordVariable: 'TRIVY_PASSWORD', usernameVariable: 'TRIVY_USERNAME')]) {
            
            sh '''
              docker run --rm \
                -e TRIVY_USERNAME="${TRIVY_USERNAME}" \
                -e TRIVY_PASSWORD="${TRIVY_PASSWORD}" \
                aquasec/trivy image \
                --severity HIGH,CRITICAL \
                --no-progress \
                "${DOCKERHUB_USERNAME}/${APP_NAME}:${IMAGE_TAG}"
            '''
          }
        }
      }
    } 

    stage('Update K8s Manifest (GitOps)') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'github-creds', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
            
            sh '''
              git config user.email "jenkins@devops-delight.com"
              git config user.name "Jenkins Automation"
              
              git remote set-url origin "https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/Nirpesh551/devops-delight-shop-cicd.git"
              
              git checkout main
              git pull origin main
              
              sed -i "s|image: hahaha555/devops-delight-shop:.*|image: hahaha555/devops-delight-shop:${IMAGE_TAG}|g" k8s/deployment.yaml
              
              git add k8s/deployment.yaml
              git commit -m "ci: update image tag to ${IMAGE_TAG} [skip ci]" || echo "No changes to commit"
              git push origin main
            '''
          }
        }
      }
    } 

    stage('DAST (OWASP ZAP)') {
      steps {
        script {
          def targetUrl = "http://100.65.215.118"

          echo "Waiting 3 minutes for ArgoCD to apply the latest deployment..."
          sleep time: 180, unit: 'SECONDS'

          echo "Initiating OWASP ZAP Dynamic Vulnerability Scan on ${targetUrl}..."

          sh """
            docker run --rm -u root -v /zap/wrk ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
              -t ${targetUrl} \
              -I
          """
        }
      }
    }
  }

  post {
    always {
      echo "Build completed: ${currentBuild.currentResult}"
      archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
    }
    success {
      slackSend(color: 'good', message: "✅ SUCCESS: The 'devops-delight-shop' deployment passed all quality and security gates! \nBuild details: ${env.BUILD_URL}")
    }
    failure {
      slackSend(color: 'danger', message: "❌ FAILED: The deployment pipeline broke. \nCheck the logs here: ${env.BUILD_URL}")
    }
  }
}
