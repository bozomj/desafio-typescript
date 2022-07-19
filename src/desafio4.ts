// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

//var apiKey = '3f301be7381a03ad8d352314dcc3ec1d';
let apiKey = 'baa428a5d7926f2d24ec5e0775eaed29';
let requestToken: string;
let username: string;
let password: string;
let sessionId: string;
let listId: string;
let usuario: any;

let ses = window.localStorage.getItem("session_id");
sessionId = ses ?? "";
let id = "aace7c2c8a064c775767f9e0b5e19673ec2dfae6";
console.log(sessionId);

let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container') as HTMLInputElement;
let criarListaButton = document.getElementById('criarLista-button') as HTMLButtonElement;
let buscarListasButton = document.getElementById('buscarListas-button') as HTMLButtonElement;
let frmLogin = document.getElementById("frm-login") as HTMLDivElement;

if(sessionId != ""){
  let loginButton = document.getElementById("login-label") as HTMLSpanElement;
  loginButton.parentNode?.removeChild(loginButton);
  frmLogin.innerHTML = '';
  console.log(loginButton) ;
}




buscarListasButton.addEventListener('click',()=>{
  buscarListas();
});

loginButton.addEventListener('click', async () => {
  await criarRequestToken()
  await logar()
  await criarSessao();
  
})

interface Ifilmes{
  id: number,
  adult: boolean,
  original_title: string,
  title: string,
  poster_path: string,
  release_date: string,
  vote_average: number
}

interface IlistaFilmes {
  results: Ifilmes[];
}

function generateCard(item: Ifilmes, ul: any){
  let imgbasePath = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/"

  let li = document.createElement('li');
  let img = document.createElement('img');
  let h4 = document.createElement('h4');
  
  h4.innerHTML = item.title;
  
  
  
  
  (item.poster_path) 
  ? img.src = imgbasePath + item.poster_path
  : img.src = "https://ipcsp.org.br/wp-content/themes/consultix/images/no-image-found-360x250.png";
  
  img.width = 150;
  img.height = 290;
  img.style.background = "#aaa3";
  li.appendChild(img)
  li.appendChild(h4)
  li.appendChild(document.createTextNode(item.release_date))

    ul.appendChild(li)
}

searchButton.addEventListener('click', async () => {
  let query = document.getElementById('search') as HTMLInputElement;
  let lista = document.getElementById("lista");
  if(query.value.length < 1){
    console.log("digite algo");
    return;
  }
  if (lista) {
    lista.outerHTML = "";
  }
  let listaDeFilmes = await procurarFilme(query.value) as IlistaFilmes;
  let ul = document.createElement('ul');
  ul.id = "lista"
  for (const item of listaDeFilmes.results) {
   generateCard(item,ul);
      
  }
  console.log(listaDeFilmes);

  let main = document.getElementById('main');
  main?.appendChild(ul);

  if(listaDeFilmes.results.length < 1){
    let h2 = document.createElement('h2');
    h2.style.textAlign = "center";
    h2.textContent = 'nenhum filme encontrado'
    main?.appendChild(h2);
  }

})

function preencherSenha() {
  password  =  (document.getElementById('senha') as HTMLInputElement).value;
  
  validateLoginButton();
}

function preencherLogin() {
  username =  (document.getElementById('login') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherApi() {
  apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

criarListaButton.addEventListener('click', async () => {
 let result = await criarLista('teste',"fazendo um teste de lista");
 console.log(result);
 

})

class HttpClient {
  static async get(data: {url: string, method: string, body?: object}) {
    
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      
      request.open(data.method, data.url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }
let body : any;

      if (data.body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
         body = JSON.stringify(data.body);
      }
      request.send(body);
    })
  }
}

lastMovie();

async function lastMovie(){
  let lastmovies = await HttpClient.get({
    //url: `https://api.themoviedb.org/3/movie/latest?api_key=${apiKey}`,
    url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`,
    method: 'GET'
  }) as IlistaFilmes;
  console.log(lastmovies);

    let ul = document.createElement('ul');
    ul.id = "lista";
    let main = document.querySelector("#main") as HTMLDivElement;
  for(let item of lastmovies.results ) {

    generateCard(item, ul);
  }
  main.appendChild(ul);
  
}

async function procurarFilme(query: string) {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result
}

async function adicionarFilme(filmeId: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  }) as any;
  requestToken = result.request_token
}

async function logar() {
  
  
  usuario = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      "username": `${username}`,
      "password": `${password}`,
      "request_token": `${requestToken}`
    }
  }).catch((e)=>{
    console.log(e);

  })
   console.log(usuario);
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })as any
  sessionId = result.session_id;
  console.log(sessionId,"sessao");
  window.localStorage.setItem("session_id", sessionId);
}

async function criarLista(nomeDaLista: string, descricao: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      "name": `${nomeDaLista}`,
      "description": `${descricao}`,
      "language": "pt-br"
    }
  })
  
}

async function adicionarFilmeNaLista(filmeId: string, listaId: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}

async function buscarListas() {
  let result = await HttpClient.get({
    //url: `https://api.themoviedb.org/3/account?api_key=baa428a5d7926f2d24ec5e0775eaed29&session_id=aace7c2c8a064c775767f9e0b5e19673ec2dfae6`,
    url: `https://api.themoviedb.org/3/account/13103966/lists?api_key=${apiKey}&language=en-US&session_id=${sessionId}&page=1`,
    method: "GET"
    
  }) as any;

  if(result) {
    let main = document.querySelector("#main") as HTMLDivElement;
    for(let item of result.results){
      main.innerHTML += item.id+"<br>";
    };
  }

  console.log(result);
}

{/* <div style="display: flex;">
  <div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
      <input id="login" placeholder="Login" onchange="preencherLogin(event)">
      <input id="senha" placeholder="Senha" type="password" onchange="preencherSenha(event)">
      <input id="api-key" placeholder="Api Key" onchange="preencherApi()">
      <button id="login-button" disabled>Login</button>
  </div>
  <div id="search-container" style="margin-left: 20px">
      <input id="search" placeholder="Escreva...">
      <button id="search-button">Pesquisar Filme</button>
  </div>
</div>*/}