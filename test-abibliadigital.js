// Exemplo de integração com ABíbliaDigital (NVI)
// Você pode usar este código para testar a API antes de integrar ao app
fetch('https://www.abibliadigital.com.br/api/verses/nvi/sl/23', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI' // Substitua pelo seu token se necessário
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
