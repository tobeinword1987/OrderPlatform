• Authentication / Session / JWT;

• Access Control / Roles / Scopes;



• Transport Security / TLS;

• Input surface / Abuse protection;

• Logging / Auditability.

# Security baseline

1) Secrets Managment

- секрети не захардкоджені в коді; (all secretes are stored at Github secrets)
- секрети не комітяться в репозиторій; (all workflows are using only secrets from github secret environments. For this purpose I use app_secret_template.yaml template file. The workflow ./github/workflows/secrets.yml in step "Apply Kubernetes secret" is responsible for getting secrets from github and setting them to the kubernetes)
- секрети не логуються; (There are no logging of any secret)
- для різних середовищ є розділення конфігурацій або хоча б чітко описана схема; (there are 2 separate environments with secrets and variables in github secrets. "dev" for stage and "prod" for production k8s namespaces)
- rotation strategyя:
    1) JWT signing secret / key; (User can authorise again and acess token will be rotated. Use auth/login endpoint)
    2) database credentials or other integration secret from github secrets (
        //TODO create workflow for rotating github secret where:
        - update secret in github secrets
        - update k8s secret
        - restart deployment for the service where secret was updated)

2) 


