// Como podemos melhorar o esse código usando TS? 

enum Eprofissao {
  atriz,
  padeiro,
  pedreiro
}

interface Ipessoa {
  nome: string,
  idade: number,
  profissao?: 'atriz' | 'padeiro'
}


let pessoa1 = {} as Ipessoa;
pessoa1.nome = "maria";
pessoa1.idade = 29;
pessoa1.profissao = "atriz";

let pessoa2: Ipessoa = {
  nome: "roberto",
  idade: 19,
  profissao: "padeiro"
}

let pessoa3: {nome: string, idade: number, profissao: Eprofissao} =  {
    nome: "Igor",
    idade: 32,
    profissao: Eprofissao.pedreiro
};

let pessoa4: Ipessoa = {
    nome: "carlos",
    idade: 19,
    
}