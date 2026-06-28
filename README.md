# Sistema de Subastas Online
**Trabajo Práctico Integrador — Programación IV — UTN FRVM — 2026**  
**Grupo 5**

---

## Descripción

Backend de una plataforma de subastas online donde los usuarios pueden publicar productos, realizar ofertas y competir hasta el cierre de cada subasta. El sistema garantiza la integridad de las pujas, respeta reglas temporales, controla la concurrencia entre usuarios y protege la información sensible.

---

## Tecnologías

- Java 21
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- SQL Server
- Maven
- Lombok

---

## Requisitos previos

- Java 21 instalado
- SQL Server instalado y corriendo
- Base de datos `subastas_db` creada en SQL Server

---

## Configuración

Editar el archivo `src/main/resources/application.properties` con los datos de tu SQL Server:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=subastas_db;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=update
app.jwt.secret=tu_clave_secreta_minimo_32_caracteres
app.jwt.expiration=86400000
```

---

## Cómo correr el proyecto

```bash
# Clonar el repositorio
git clone https://github.com/BEnzoBurgos/tpi-subastas-grupo5.git

# Entrar a la carpeta
cd tpi-subastas-grupo5/subastas

# Correr el proyecto
.\mvnw spring-boot:run
```

La aplicación arranca en `http://localhost:8080`

---

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| USER | Puede registrarse, consultar subastas y realizar pujas |
| SELLER | Puede publicar productos y crear subastas |
| ADMIN | Puede moderar, suspender usuarios, cancelar subastas y resolver disputas |

---

## Endpoints principales

| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| POST | /api/auth/register | Público | Registrar usuario |
| POST | /api/auth/login | Público | Login y obtención de JWT |
| POST | /api/subastas | SELLER | Crear subasta |
| POST | /api/subastas/{id}/pujas | USER | Registrar puja |
| GET | /api/subastas | Autenticado | Listar subastas |
| GET | /api/usuarios/me | Autenticado | Ver mi perfil |
| PUT | /api/admin/usuarios/{id}/bloquear | ADMIN | Bloquear usuario |

Ver documentación completa para la lista de todos los endpoints.

---

## Probar los endpoints

Importar la colección Thunder Client desde `docs/thunder-collection.json`:

1. Abrir Thunder Client en VS Code
2. Click en Collections → `...` → Import
3. Seleccionar `docs/thunder-collection.json`
4. Hacer login y copiar el token en la variable `token` de la colección

---

## Documentación

-  [Documentación técnica completa (PDF)](docs/TPI_Subastas_Documentacion.pdf)
-  [Diagrama ER y Script SQL](https://drive.google.com/drive/u/0/folders/1TN_u5253fKGE2wg7kejuTRt90PRmVCCQ)
-  [Colección Thunder Client](docs/thunder-collection.json)
