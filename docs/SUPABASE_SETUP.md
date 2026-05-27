## Setup do Supabase (PCP)

Este projeto usa **RBAC via** `public.roles` + `public.profiles.role_id` e policies baseadas em `public.get_user_role()`.

### 1) Aplicar migrations no Supabase

No painel do Supabase, abra **SQL Editor** e execute as migrations na ordem (do menor timestamp para o maior), ou use Supabase CLI.

Arquivos principais neste repositório:

- `supabase/migrations/20260526000000_init_schema.sql` (cria tabelas + função `get_user_role()` + seed de roles)
- `supabase/migrations/20260526125000_profiles_and_grid_casting_rls.sql` (RLS para `profiles` e `grid_casting_production`)
- demais `supabase/migrations/*_rls.sql` (RLS/índices para os módulos)

### 2) Usuário admin (já criado via MCP)

Credenciais temporárias do primeiro acesso:

- **E-mail:** `admin@pcp.local`
- **Senha:** `Admin123!`
- **Role:** `admin`

Troque a senha após o primeiro login (painel Supabase ou fluxo do app).

Se precisar recriar manualmente:

1. No painel do Supabase, vá em **Authentication → Users** e crie um usuário (ex.: `admin@pcp.local`).
2. Defina uma senha temporária **forte** (você pode trocar depois no app ou no painel).
3. Copie o `user.id` (UUID) do usuário criado.
4. No **SQL Editor**, execute:

```sql
-- 1) Garantir que o role admin existe
insert into public.roles (name, description)
values ('admin', 'Acesso total ao sistema')
on conflict (name) do nothing;

-- 2) Criar profile para o usuário (troque os valores abaixo)
insert into public.profiles (id, role_id, full_name, is_active)
values (
  'COLE_AQUI_O_USER_ID',
  (select id from public.roles where name = 'admin' limit 1),
  'Administrador',
  true
)
on conflict (id) do update
set role_id = excluded.role_id,
    full_name = excluded.full_name,
    is_active = excluded.is_active;
```

### 3) Conferência rápida

- Se o login autenticar mas o app “derrubar” a sessão com **“Perfil não encontrado”**, é porque o `public.profiles` ainda não foi criado para aquele usuário.
- Se inserts/updates falharem com erro de policy, verifique se o `profiles.role_id` está apontando para `roles.name = 'admin'`.
