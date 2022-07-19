// Como podemos rodar isso em um arquivo .ts sem causar erros? 

let employee = {
  code: 1,
  name: "nome"
};
employee.code = 10;
employee.name = "John";

const employee1: {code: number, name: string} = {
  code: 2,
  name: "Marcos"
}

interface Iemployee {code: number, name: string}

const joao: Iemployee = {
  code: 3,
  name: "João"
}

let thiago = {} as Iemployee;

thiago.code = 7;
thiago.name = "Thiago";


