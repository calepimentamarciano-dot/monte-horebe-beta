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
- `/admin/vendas/nova` Lança venda manual com um ou mais produtos e baixa estoque automaticamente.
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
6. Rode a migration em `supabase/migrations/202606180001_cancel_sales.sql`.
7. Rode a migration em `supabase/migrations/202606180002_fix_cancel_sales.sql`.
8. Rode a migration em `supabase/migrations/202606190001_multi_item_sales.sql`.
9. Rode a migration em `supabase/migrations/202606200001_product_cost_profit.sql`.
10. Rode a migration em `supabase/migrations/202606210001_sales_discount.sql`.
11. Crie um usuário admin no Supabase Auth.
12. Confirme que o bucket `products` existe em Storage e está público.
13. Rode o projeto localmente com `npm run dev`.
14. Acesse `/login`.
15. Cadastre produtos no painel.
16. Veja os produtos ativos no catálogo público.

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

A migration de cancelamento de vendas adiciona:

- `sales.status`
- `sales.canceled_at`
- `sales.canceled_by`
- `sales.cancel_reason`
- índice para `sales.status`
- RPC `public.cancel_sale`, usada para cancelar venda e devolver estoque em uma transação.

A migration de vendas com múltiplos itens adiciona:

- `sale_items`
- políticas RLS autenticadas para itens da venda
- RPC `public.create_multi_item_sale`, usada para criar uma venda com vários produtos, baixar estoque e registrar movimentações em uma transação.
- compatibilidade com vendas antigas salvas diretamente em `sales.product_id`, `sales.product_name`, `sales.quantity`, `sales.unit_price` e `sales.total_value`.
- atualiza `public.cancel_sale` para devolver estoque item por item quando houver `sale_items`, mantendo fallback para vendas antigas.

A migration de custo, lucro e margem adiciona:

- `products.cost_price`, usado apenas no admin como preço de custo interno.
- `sale_items.unit_price`, preço de venda salvo no momento da venda.
- `sale_items.unit_cost`, custo salvo no momento da venda.
- `sale_items.total_cost` e `sale_items.gross_profit`, usados para calcular lucro por item.
- `sales.total_value`, faturamento bruto da venda.
- `sales.total_cost`, custo total da venda.
- `sales.gross_profit`, lucro bruto estimado da venda.
- backfill para vendas antigas com `sale_items` ou, quando não houver itens, com os campos antigos de `sales`.

A migration de desconto em vendas adiciona:

- `sales.subtotal_value`, valor da venda antes do desconto.
- `sales.discount_percent`, percentual de desconto aplicado.
- `sales.discount_value`, valor descontado.
- `sales.total_value`, valor final pago pelo cliente, já com desconto.
- `sales.gross_profit`, lucro bruto estimado considerando o desconto aplicado.
- backfill para vendas antigas com desconto 0.

## Estoque, Vendas e Faturamento

- O estoque é controlado em `/admin/estoque`; o formulário de produto não edita estoque inicial nem estoque mínimo.
- Configure `Preço de venda` e `Preço de custo` no formulário de produto. O preço de custo é informação interna e não aparece para clientes.
- Use `/admin/estoque` para ajustar saldo, registrar entrada, saída ou ajuste e ver o histórico de movimentações.
- O card `Estoque baixo` conta produtos com estoque atual menor ou igual ao estoque mínimo, incluindo produtos zerados.
- Use `/admin/vendas/nova` para lançar uma venda manual com um ou mais produtos e, se necessário, aplicar desconto sobre o subtotal. Ao salvar, o sistema cria o cabeçalho em `sales`, grava os produtos em `sale_items`, diminui `products.stock_quantity` e registra movimentações `venda` em `stock_movements`.
- O desconto é aplicado sobre `sales.subtotal_value`; `sales.total_value` representa o valor final com desconto e `sales.discount_value` representa o valor descontado.
- Cada venda salva o custo do produto daquele momento, então mudanças futuras em `products.cost_price` não alteram o lucro histórico.
- Use `/admin/vendas` para cancelar uma venda lançada errada. Vendas não são apagadas: elas ficam com status `canceled`, preservando o histórico para auditoria.
- Ao cancelar uma venda, o estoque é devolvido automaticamente para cada item e uma movimentação `cancelamento` é registrada em `stock_movements`.
- Vendas canceladas não contam no faturamento, nos cards de receita, no total de vendas, no ticket médio nem nos produtos mais vendidos. O ranking de produtos usa `sale_items` para vendas novas e mantém fallback para vendas antigas.
- Use `/admin/faturamento` para ver faturamento bruto, custo, lucro estimado, margem média, ticket médio, produto mais vendido, vendas recentes, produtos mais vendidos e receita por canal.
- Se uma venda tiver quantidade maior que o estoque disponível, ela não é salva e o estoque não é alterado.
- A sidebar do admin é organizada em grupos: `Produtos` e `Vendas`, com subabas para reduzir poluição visual.

Checklist antes do deploy:

- Rodar a migration nova no Supabase.
- Rodar a migration de cancelamento de vendas no Supabase.
- Rodar a migration corretiva `202606180002_fix_cancel_sales.sql` no Supabase.
- Rodar a migration de vendas com múltiplos itens `202606190001_multi_item_sales.sql` no Supabase.
- Rodar a migration de custo e lucro `202606200001_product_cost_profit.sql` no Supabase.
- Rodar a migration de desconto em vendas `202606210001_sales_discount.sql` no Supabase.
- Conferir RLS.
- Fazer deploy na Vercel.
- Testar `/admin/vendas/nova`.
- Testar cancelamento em `/admin/vendas`.
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
