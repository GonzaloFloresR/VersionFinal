# VersionFinal

El EndPoint /api/users/premium/:uid verifica que el usuario.documents contenga 3 documentos para transformar Users en Premium
El EndPoint api/users/:uid/documents Debe recibir un Array "name" con el nombre de los documentos que se envian. 
  - Se verifica que "name" contenga la misma cantidad de nombres que cantidad de archivos que se envia.
  - Se verifica que los nombres coincidan con "identificación", "comprobante de domicilio", "comprobante de estado de cuenta"
  - En caso de recibir archivos con nombres diferentes a los esperados, se elimina el archivo recibido.
  - IMPORTANTE - Solo se pueden comprar productos en : http://localhost:8080/products

