/**
 * Copia todas as coleções de um cluster MongoDB para outro.
 *
 * Usado na troca de conta do Atlas (o cluster passou a ser o da cliente). Lê a
 * origem e o destino de variáveis de ambiente para nenhuma credencial ficar no
 * código nem no histórico do terminal:
 *
 *   MIGRATE_FROM_URI  cluster de origem (o que tem os dados)
 *   MIGRATE_TO_URI    cluster de destino (o novo)
 *
 * Uso:
 *   npx tsx scripts/migrate-db.ts                  # copia (recusa se o destino tiver dados)
 *   npx tsx scripts/migrate-db.ts --force          # sobrescreve o destino
 *   npx tsx scripts/migrate-db.ts --skip=users     # não toca nessas coleções
 *
 * O `--skip` existe para o caso comum da troca de conta: o admin do destino já
 * foi criado com as credenciais novas (`npm run db:seed`), e copiar a coleção
 * `users` da origem apagaria esse acesso e devolveria o login antigo.
 *
 * Só copia dados; os índices são recriados pelo Mongoose quando a aplicação
 * sobe (cada model declara os seus).
 */
import { MongoClient } from "mongodb";

async function main(): Promise<void> {
  const fromUri = process.env.MIGRATE_FROM_URI;
  const toUri = process.env.MIGRATE_TO_URI;
  const force = process.argv.includes("--force");
  const skip = new Set(
    process.argv
      .filter((arg) => arg.startsWith("--skip="))
      .flatMap((arg) => arg.slice("--skip=".length).split(","))
      .map((name) => name.trim())
      .filter(Boolean)
  );

  if (!fromUri || !toUri) {
    throw new Error("Defina MIGRATE_FROM_URI e MIGRATE_TO_URI no ambiente.");
  }
  if (fromUri === toUri) {
    throw new Error("Origem e destino são o mesmo cluster — nada a fazer.");
  }

  const fromClient = new MongoClient(fromUri);
  const toClient = new MongoClient(toUri);

  try {
    await Promise.all([fromClient.connect(), toClient.connect()]);
    // O nome do banco vem da própria URI (o padrão do Mongoose é "test").
    const fromDb = fromClient.db();
    const toDb = toClient.db();

    const collections = (await fromDb.listCollections().toArray())
      .map((c) => c.name)
      .filter((name) => !name.startsWith("system."))
      .filter((name) => !skip.has(name))
      .sort();

    console.log(`Origem : ${fromDb.databaseName} (${collections.length} coleções)`);
    console.log(`Destino: ${toDb.databaseName}`);
    if (skip.size > 0) {
      console.log(`Preservadas no destino (não copiadas): ${[...skip].join(", ")}`);
    }
    console.log();

    // Confere antes de escrever: destino com dados só é sobrescrito com --force,
    // para uma segunda execução não duplicar tudo em silêncio.
    if (!force) {
      for (const name of collections) {
        const existing = await toDb.collection(name).countDocuments();
        if (existing > 0) {
          throw new Error(
            `O destino já tem ${existing} documento(s) em "${name}". ` +
              `Rode com --force para sobrescrever.`
          );
        }
      }
    }

    let totalCopied = 0;
    const report: { colecao: string; origem: number; destino: number }[] = [];

    for (const name of collections) {
      const docs = await fromDb.collection(name).find({}).toArray();
      const target = toDb.collection(name);

      if (force) {
        await target.deleteMany({});
      }
      if (docs.length > 0) {
        // ordered:false segue copiando o resto se um documento falhar.
        await target.insertMany(docs, { ordered: false });
      }

      const copied = await target.countDocuments();
      report.push({ colecao: name, origem: docs.length, destino: copied });
      totalCopied += copied;
      console.log(`  ${name.padEnd(16)} ${String(docs.length).padStart(4)} → ${copied}`);
    }

    console.log(`\nTotal copiado: ${totalCopied} documento(s).`);

    const divergentes = report.filter((r) => r.origem !== r.destino);
    if (divergentes.length > 0) {
      console.error("\nATENÇÃO — coleções com contagem diferente:");
      divergentes.forEach((d) =>
        console.error(`  ${d.colecao}: origem ${d.origem}, destino ${d.destino}`)
      );
      process.exitCode = 1;
      return;
    }
    console.log("Conferência OK: todas as coleções bateram origem = destino.");
  } finally {
    await Promise.allSettled([fromClient.close(), toClient.close()]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
