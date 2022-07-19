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
let sessionId: string | null;
let listId = -1;
let usuario: IUsuario;
let page = 1;
let totalPage: number;
let query: string;
let _myList: IMyList;
let lastsearch: string;
let lastPage: number;
let nextPage = (): void => { };


//let ses = window.localStorage.getItem("session_id");

sessionId = window.localStorage.getItem("session_id");
          

let inputSearc = document.getElementById('search') as HTMLInputElement;
let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container') as HTMLInputElement;
let criarListaButton = document.getElementById('criarLista-button') as HTMLButtonElement;
let buscarListasButton = document.getElementById('buscarListas-button') as HTMLButtonElement;
let frmLogin = document.getElementById("frm-login") as HTMLDivElement;
let logo = document.getElementById("logo") as HTMLHeadElement;
let main = document.getElementById("main") as HTMLDivElement;
let logoutButton = document.getElementById("logout") as HTMLSpanElement;

logo.addEventListener('click', () => {

  clear();
  lastMovie();

});


logoutButton.addEventListener('click', logout);

(sessionId) ? removeElementByClass('public') : removeElementByClass('private')













buscarListasButton.addEventListener('click', () => {
  clear()
  buscarListas();
});

loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
  if(sessionId)
  window.location.reload();

})

interface Ifilmes {
  id: number,
  adult: boolean,
  original_title: string,
  title: string,
  poster_path: string,
  release_date: string,
  vote_average: number

}

interface IlistaFilmes {
  total_pages: number
  results: Ifilmes[];
}
function logout(){
  window.localStorage.removeItem("session_id");
  window.location.reload();
}


function removeElementByClass (_class: string) {
  let remove = document.getElementsByClassName(_class);
  while(remove.length){
    let n = remove.length -1;
    remove[n].parentNode?.removeChild(remove[n]);
  }

}


function generateCard(item: Ifilmes, ul: any, myList: boolean = false) {
  let imgbasePath = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/"

  let li = document.createElement('li');
  let img = document.createElement('img');
  let h4 = document.createElement('h4');
  li.id = item.id.toString();
  h4.innerHTML = item.title;
  main.style.backgroundImage = `url(${imgbasePath + item.poster_path})`;
  main.style.backgroundColor = "#00f3";
  main.style.backgroundBlendMode = "overlay";



  (item.poster_path)
    ? img.src = imgbasePath + item.poster_path
    : img.src = "https://ipcsp.org.br/wp-content/themes/consultix/images/no-image-found-360x250.png";

  img.width = 150;
  img.height = 290;
  img.style.background = "#aaa3";
  li.appendChild(img)
  li.appendChild(h4)
  li.appendChild(document.createTextNode(item.release_date));
  if (listId > 0) {
    let addButton = document.createElement('button') as HTMLButtonElement;
    let text = "";
    let color = "";
    if(myList) 
    {
      text = "REMOVER";
      color = "red";
    }else
    {
      text = "ADICIONAR";
      color = "green";
      
    }
    
    addButton.innerText = text;
    
    addButton.addEventListener('click', () => {
      addButton.style.background = color;
      (myList) ? removerFilmeDaLista(item.id, listId, item) : adicionarFilmeNaLista(item.id, listId);
      
    });

    li.appendChild(addButton);

  }

  ul.appendChild(li)

  
}

searchButton.addEventListener('click', async () => {
  if (inputSearc.value == "") return
  page = 1;
  main.innerHTML = "";
  if (listId > 0) showList(_myList);
  procurarFilme();


})

function preencherSenha() {
  password = (document.getElementById('senha') as HTMLInputElement).value;

  validateLoginButton();
}

function preencherLogin() {
  username = (document.getElementById('login') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherApi() {
  apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
  validateLoginButton();
}

function validateLoginButton() {
  preencherLogin();
  preencherSenha();
  if (password && username) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

criarListaButton.addEventListener('click', async () => {
  clear();

  let section = document.createElement('section') as HTMLSelectElement;
  let nameList = document.createElement('input') as HTMLInputElement;
  let descricaoList = document.createElement('textarea') as HTMLTextAreaElement;
  let criarListButton = document.createElement('button') as HTMLButtonElement;
  let title = document.createElement('h2') as HTMLHeadElement;

  section.className = 'frm-login';
  title.innerText = 'Criar Lista de Filmes';
  criarListButton.innerHTML = "Criar Lista";

  descricaoList.placeholder = 'Coloque uma breve descrição sobre a lista';
  nameList.placeholder = "Nome da lista";

  section.appendChild(title);
  section.appendChild(nameList);
  section.appendChild(descricaoList);
  section.appendChild(criarListButton);

  main.appendChild(section);

  criarListButton.addEventListener('click', async () => {
    let name = nameList.value;
    let descricao = descricaoList.value;

    if (name != "" && descricao != "") {
      clear();
      listId = await criarLista(name, descricao);
      let result = await pegarLista(listId);

      let ul = document.createElement('ul');
      ul.className = "myList";
      ul.appendChild(gerarCardList(result));
      main.appendChild(ul);

      

    }
  })





})



//carrega mais resultados quando o scroll chegar no final
document.addEventListener('scroll', (e) => {
  
  if (totalPage < 2 || page == lastPage) return;

  let bounding = main.getBoundingClientRect();
  if (bounding.bottom - 10 < window.innerHeight && page <= totalPage)  nextPage();


});


class HttpClient {
  static async get(data: { url: string, method: string, body?: object }) {

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
      let body: any;

      if (data.body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(data.body);
      }
      request.send(body);
    })
  }
}

lastMovie();

function clear() {
  listId = -1;
  page = 1;
  main.innerHTML = '';
}
async function lastMovie() {
  lastPage = page;
  nextPage = lastMovie;
  let lastmovies = await HttpClient.get({
    url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}`,
    method: 'GET'
  }) as IlistaFilmes;
  
  totalPage = lastmovies.total_pages;
  
  let ul = document.createElement('ul');
  ul.id = "lista";
  for (let item of lastmovies.results) {
    
    generateCard(item, ul, false);
  }
  page++;
  main.appendChild(ul);

  
}

async function procurarFilme() {
  lastsearch = lastsearch == "" ? query : lastsearch;
  nextPage = procurarFilme;
  let ul = document.createElement('ul');
  ul.id = "lista";

  lastPage = page;

  if (inputSearc.value.length < 1 && lastsearch == "") {
    alert("campo de pesquisa está vazio");
    return -1;
  }
  query = encodeURI(inputSearc.value)

  let listaDeFilmes = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`,
    method: "GET"
  }) as IlistaFilmes

  for (const item of listaDeFilmes.results) {
    generateCard(item, ul,false);

  }
  totalPage = listaDeFilmes.total_pages;
  



  main.appendChild(ul);

  if (listaDeFilmes.results.length < 1) {
    let h2 = document.createElement('h2');
    h2.style.textAlign = "center";
    h2.textContent = 'nenhum filme encontrado'
    main?.appendChild(h2);
  }

  page++;
}

// async function adicionarFilme(filmeId: number) {

//   let result = await HttpClient.get({
//     url: `https://api.themoviedb.org/3/list/${listId}/add_item?api_key=${apiKey}`,
//     method: "GET",
//     body: {
//       "media_id": `${filmeId}`
//     }
//   })
//   console.log(result);
// }

async function criarRequestToken() {
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
  }).catch((e) => {
    
    return 
  }) as IUsuario;
  
  
}


interface IUsuario {
  expires_at: string,
  request_token: string,
  success: boolean

}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  }) as any
  sessionId = result.session_id;
  window.localStorage.setItem("session_id", sessionId!);
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
  }) as { list_id: number }
  return result.list_id;
}

async function adicionarFilmeNaLista(filmeId: number, listaId: number) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      "media_id": `${filmeId}`
    }
  })

}
async function removerFilmeDaLista(filmeId: number, listaId: number, item: Ifilmes ) {
  
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/remove_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      "media_id": `${filmeId}`
    }
  }).then(()=>{
    let node = document.getElementById(item.id.toString()) as HTMLLIElement;
    node?.parentNode?.removeChild(node);
  });
}


async function pegarLista(list_Id: number) {
  listId = list_Id;
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${list_Id}?api_key=${apiKey}`,
    method: "GET"
  }) as IMyList;
  _myList = result;
  return result;
}




interface IResults<T> {
  total_pages: number;
  results: T[];
}

interface IMyList {
  created_by: string;
  description: string;
  id: number;
  favorite_count: number;
  name: string;
  poster_path: string;
  item_count: number;
  items: []
}
function gerarCardList(item: IMyList) {
  let urlImage = "url(https://www.viagenscinematograficas.com.br/wp-content/uploads/2019/01/Praia-do-Espelho-Dicas-Bahia-13-990x743.jpg)";
  let li = document.createElement('li') as HTMLLIElement;
  let background = document.createElement('span') as HTMLSpanElement;
  let name = document.createElement('h2');
  let count = document.createElement('span');
  name.className = "title"
  name.innerText = item.name;
  count.innerText = item.item_count.toString() + " Filmes";
  background.className = "background-image";
  background.style.backgroundImage = urlImage;
  li.appendChild(background);
  li.id = item.id.toString();
  li.appendChild(name);
  li.appendChild(count);

  li.addEventListener('click', async () => {

    let lista = await pegarLista(item.id);
    showList(lista);
  })
  return li;

}

function showList(list: IMyList) {
  clear();
  listId = list.id;
  const newElement = (e: string) => { return document.createElement(e) };
  let section = newElement('section');
  let header = newElement('header');
  let title = newElement('h1');
  let container = newElement('div');
  let descricao = newElement('div');
  let filmes = newElement('section');

  filmes.id = "mylistfilmes";




  title.innerText = list.name;
  descricao.innerHTML = `<p>Sobre esta lista</p><span>${list.description}</span>`;
  container.innerHTML = `<P>Lista criada por</P><span> ${list.created_by} </span>`;

  title.addEventListener('click',()=>{
    inputSearc.value = "";
    showList(_myList);
  })

  section.className = "lista";

  section.appendChild(header);
  header.appendChild(title);
  header.appendChild(container);
  header.appendChild(descricao);

  if (inputSearc.value == "")
    getFilmesMyList(listId);

  
  main.appendChild(section);
  main.appendChild(filmes)


}

async function buscarListas() {
  nextPage = buscarListas;

  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/account/13103966/lists?api_key=${apiKey}&language=en-US&session_id=${sessionId}&page=1`,
    method: "GET"

  }) as IResults<IMyList>;
  totalPage = result.total_pages;

  if (result) {

    clear()
    let ul = document.createElement('ul');
    ul.className = 'myList';

    for (let item of result.results) {
      let li = gerarCardList(item);
      ul.appendChild(li);
    };
    main.appendChild(ul);
  }
  
}



async function getFilmesMyList(id: number) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: 'GET'
  }) as IMyList;

  if (result.items.length > 0) {
    let ul = document.createElement('ul') as HTMLUListElement;
    ul.id = 'lista';
    for (let item of result.items) {
      generateCard(item, ul, true);
    }
    main.appendChild(ul);
  }
  

}

