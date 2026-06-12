# Monte Horebe | Cafés Especiais

Micro-SaaS e catálogo digital premium para a marca Monte Horebe, criado com Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Supabase, Supabase Storage e Lucide React.

## Rotas

- `/` Página inicial premium com hero, mosaico de produtos, diferenciais, parceiros, mockup e CTA.
- `/catalogo` Catálogo completo com busca e filtros por categoria, torra e notas sensoriais.
- `/produto/[slug]` Página individual do café com dados técnicos e WhatsApp personalizado.
- `/sobre` Página institucional.
- `/contato` Contato com WhatsApp, formulário simulado, Instagram e e-mail.
- `/admin` Painel administrativo com Supabase Auth, produtos, categorias e upload.

## Instalação

```bash
npm install
npm run dev
```

Em Windows, se o cache global do npm der erro de permissão, use:

```bash
npm install --cache .\work\npm-cache
```

## Variáveis de ambiente

Crie `.env.local` com base em `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_WHATSAPP_NUMBER` deve conter apenas o número com DDI e DDD, por exemplo `5531999999999`.

## Supabase

1. Crie um projeto Supabase.
2. Rode a migration em `supabase/migrations/202606120001_initial_schema.sql`.
3. Confirme que o bucket `products` existe em Storage e está público.
4. Crie um usuário em Authentication para acessar `/admin`.
5. Preencha `.env.local` com URL e anon key do projeto.

A migration cria:

- `profiles`
- `categories`
- `products`
- políticas RLS para leitura pública de produtos ativos e categorias
- CRUD autenticado para produtos e categorias
- bucket público `products` e políticas de upload para usuários autenticados

## Fallback sem Supabase

Enquanto o Supabase não estiver configurado, o site usa `lib/mock-products.ts` com seis cafés de exemplo e mantém o painel `/admin` em modo de prévia. Depois que as variáveis forem preenchidas, as funções em `lib/products.ts` e `lib/categories.ts` passam a buscar dados reais.

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

O projeto já inclui metadata global, Open Graph, `robots.ts` e `sitemap.ts`.
