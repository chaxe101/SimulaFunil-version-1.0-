# Sistema Clínica Vida+
pacientes = []

def cadastrar_paciente():
    nome = input("Nome do paciente: ")
    idade = int(input("Idade: "))
    telefone = input("Telefone: ")
    paciente = {'Nome': nome, 'Idade': idade, 'Telefone': telefone}
    pacientes.append(paciente)
    print(f"Paciente {nome} cadastrado com sucesso!")

def exibir_estatisticas():
    total_pacientes = len(pacientes)
    idades = [paciente['Idade'] for paciente in pacientes]
    idade_media = sum(idades) / total_pacientes if total_pacientes > 0 else 0
    mais_novo = min(idades) if idades else None
    mais_velho = max(idades) if idades else None
    
    print(f"Total de pacientes: {total_pacientes}")
    print(f"Idade média dos pacientes: {idade_media:.2f}")
    print(f"Paciente mais novo: {mais_novo}")
    print(f"Paciente mais velho: {mais_velho}")

def buscar_paciente():
    nome = input("Digite o nome do paciente: ")
    paciente = next((p for p in pacientes if p['Nome'] == nome), None)
    if paciente:
        print(f"Paciente encontrado: {paciente}")
    else:
        print("Paciente não encontrado.")

def listar_pacientes():
    if pacientes:
        for paciente in pacientes:
            print(f"Nome: {paciente['Nome']}, Idade: {paciente['Idade']}, Telefone: {paciente['Telefone']}")
    else:
        print("Nenhum paciente cadastrado.")

def menu():
    while True:
        print("\n=== SISTEMA CLÍNICA VIDA+ ===")
        print("1. Cadastrar paciente")
        print("2. Ver estatísticas")
        print("3. Buscar paciente")
        print("4. Listar todos os pacientes")
        print("5. Sair")
        
        opcao = input("Escolha uma opção: ")
        if opcao == '1':
            cadastrar_paciente()
        elif opcao == '2':
            exibir_estatisticas()
        elif opcao == '3':
            buscar_paciente()
        elif opcao == '4':
            listar_pacientes()
        elif opcao == '5':
            print("Saindo...")
            break
        else:
            print("Opção inválida!")

menu()
