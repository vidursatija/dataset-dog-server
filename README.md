## How to deploy

```shell
gcloud builds submit --tag europe-west1-docker.pkg.dev/projectpal-e70b9/cloud-run-source-deploy/projectzero-production
# get the SHA of the build
# replace SHA inside service.yaml
gcloud run services replace service.yaml
```
