# Monte Horebe | Cafés Especiais

Micro-SaaS e catálogo digital premium para a marca Monte Horebe, criado com Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Supabase, Supabase Storage e Lucide React.

## Rotas Públicas

- `/` Página inicial premium com hero, produtos em destaque, diferenciais, seção institucional e CTA.
- `/catalogo` Catálogo completo com busca e filtros por categoria, torra e notas sensoriais.
- `/produto/[slug]` Página individual do café com dados técnicos e WhatsApp personalizado.
- `/sobre` Página institucional.
- `/contato` Contato com WhatsApp, formulário, Instagram e e-mail.

Clientes não precisam de login para ver catálogo, acessar produtos ou chamar no WhatsApp.

## Navegação

- A aba `Admin` no cabeçalho leva para `/login`.
- A aba `Produtos` foi removida porque `Catálogo` já cumpre essa função.
- O menu final do cabeçalho é: `Início`, `Catálogo`, `Sobre`, `Contato` e `Admin`.
- O login é apenas para administração; clientes continuam acessando as rotas públicas sem autenticação.

## Rotas Administrativas

- `/login` Login exclusivo do administrador.
- `/admin` Dashboard protegido por Supabase Auth.
- `/admin/produtos` Lista, ativa/desativa, destaca, edita e exclui produtos.
- `/admin/produtos/novo` Cadastra produto com upload de imagem.
- `/admin/produtos/[id]/editar` Edita produto existente.
- `/admin/categorias` Cria, edita e exclui categorias.
- `/admin/estoque` Controla estoque atual, estoque mínimo e movimentações.
- `/admin/vendas` Lista vendas registradas.
- `/admin/vendas/nova` Lança venda manual e baixa estoque automaticamente.
- `/admin/faturamento` Mostra resumo financeiro por período, produto e canal.

Se alguém acessar `/admin` sem sessão ativa, o app redireciona para `/login`.

## Instalação

```bash
npm install
npm run dev
```

Em Windows, se o cache global do npm der erro de permissão, use:

```bash
npm install --cache .\work\npm-cache
```

## Variáveis de Ambiente

Crie `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_WHATSAPP_NUMBER` deve conter apenas o número com DDI e DDD, por exemplo `5531999999999`.

## Supabase

1. Crie um projeto no Supabase.
2. Copie a URL do projeto e a Anon Key.
3. Crie `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Rode a migration em `supabase/migrations/202606120001_initial_schema.sql`.
5. Rode a migration em `supabase/migrations/202606150001_stock_sales_billing.sql`.
6. Crie um usuário admin no Supabase Auth.
7. Confirme que o bucket `products` existe em Storage e está público.
8. Rode o projeto localmente com `npm run dev`.
9. Acesse `/login`.
10. Cadastre produtos no painel.
11. Veja os produtos ativos no catálogo público.

A migration cria:

- `profiles`
- `categories`
- `products`
- políticas RLS para leitura pública de produtos ativos e categorias
- CRUD autenticado para produtos e categorias
- bucket público `products` e políticas de upload para usuários autenticados

A migration de estoque, vendas e faturamento adiciona:

- `products.stock_quantity` e `products.min_stock`
- `sales`
- `stock_movements`
- índices para consultas por data e produto
- políticas RLS para acesso autenticado às vendas e movimentações

## Estoque, Vendas e Faturamento

- Configure produtos com estoque inicial e estoque mínimo no formulário de produto.
- Use `/admin/estoque` para ajustar saldo, registrar entrada, saída ou ajuste e ver o histórico de movimentações.
- Use `/admin/vendas/nova` para lançar uma venda manual. Ao salvar, o sistema cria o registro em `sales`, diminui `products.stock_quantity` e registra uma movimentação `venda` em `stock_movements`.
- Use `/admin/faturamento` para ver faturamento de hoje, últimos 7 dias, mês atual, total de vendas, ticket médio, produto mais vendido, vendas recentes, produtos mais vendidos e receita por canal.
- Se uma venda tiver quantidade maior que o estoque disponível, ela não é salva e o estoque não é alterado.

Checklist antes do deploy:

- Rodar a migration nova no Supabase.
- Conferir RLS.
- Fazer deploy na Vercel.
- Testar `/admin/vendas/nova`.
- Testar `/admin/estoque`.
- Testar `/admin/faturamento`.

## Imagens e Marca

- A logo oficial fica em `/public/images/logo-monte-horebe.png`.
- A imagem da seção `Sobre a marca` fica em `/public/images/sobre-monte-horebe.jpg`.
- Para trocar a imagem da seção `Sobre a marca`, substitua o arquivo mantendo o mesmo nome.
- O upload de imagem dos produtos é feito pelo admin: a imagem vai para o bucket `products` no Supabase Storage, a URL pública é salva em `products.image_url`, e catálogo, home e página do produto exibem essa imagem.
- O upload de imagem do produto aceita JPG, PNG e WEBP. Tamanho máximo recomendado: 10 MB. O limite de Server Actions foi configurado para `10mb` em `next.config.ts`.
- O botão flutuante do WhatsApp foi removido; os CTAs e links de WhatsApp continuam ativos nas áreas do site.

## Fallback sem Supabase

Enquanto o Supabase não estiver configurado, o site público usa `lib/mock-products.ts` com seis cafés de exemplo. Depois que as variáveis forem preenchidas, as funções em `lib/products.ts` e `lib/categories.ts` passam a buscar dados reais.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Publicação na Vercel

1. Envie o repositório para GitHub.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente.
4. Publique.

O projeto inclui metadata global, Open Graph, `robots.ts` e `sitemap.ts`.
