#!/usr/bin/env node

/**
 * GameDin Migration Tool
 * 
 * This script migrates data from AWS Amplify to Shopify.
 * It handles users, products, and custom metadata.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Migration modules
const userMigration = require('./user-migration');
const productMigration = require('./product-migration');
const metafieldMigration = require('./metafield-migration');
const contentMigration = require('./content-migration');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../app/.env') });

// Setup CLI
const program = new Command();

program
  .name('gamedin-migration')
  .description('CLI tool for migrating GameDin data from AWS Amplify to Shopify')
  .version('1.0.0');

program
  .command('migrate')
  .description('Run the full migration process')
  .option('-u, --users', 'Migrate users')
  .option('-p, --products', 'Migrate products')
  .option('-m, --metafields', 'Migrate metafields')
  .option('-c, --content', 'Migrate user-generated content')
  .option('--dry-run', 'Perform a dry run without making actual changes')
  .option('--aws-profile <profile>', 'AWS profile to use')
  .option('--shopify-store <store>', 'Shopify store domain')
  .action(async (options) => {
    console.log(chalk.blue('🎮 GameDin Migration Tool'));
    console.log(chalk.blue('======================='));

    if (!options.users && !options.products && !options.metafields && !options.content) {
      console.log(chalk.yellow('No migration options selected. Using default: all'));
      options.users = options.products = options.metafields = options.content = true;
    }

    // Confirm environment
    const shopifyStore = options.shopifyStore || process.env.SHOPIFY_SHOP;
    if (!shopifyStore) {
      console.error(chalk.red('Error: No Shopify store specified. Use --shopify-store or set SHOPIFY_SHOP env variable.'));
      process.exit(1);
    }

    console.log(chalk.green(`Target Shopify Store: ${shopifyStore}`));
    console.log(chalk.yellow(`Dry Run Mode: ${options.dryRun ? 'Enabled' : 'Disabled'}`));
    
    // Run migrations
    try {
      if (options.users) {
        await runMigration('Users', userMigration.migrate, options);
      }
      
      if (options.products) {
        await runMigration('Products', productMigration.migrate, options);
      }
      
      if (options.metafields) {
        await runMigration('Metafields', metafieldMigration.migrate, options);
      }
      
      if (options.content) {
        await runMigration('User Content', contentMigration.migrate, options);
      }
      
      console.log(chalk.green('✅ Migration completed successfully!'));
    } catch (error) {
      console.error(chalk.red(`❌ Migration failed: ${error.message}`));
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate migration data without performing migration')
  .option('-u, --users', 'Validate user data')
  .option('-p, --products', 'Validate product data')
  .option('--aws-profile <profile>', 'AWS profile to use')
  .action(async (options) => {
    console.log(chalk.blue('🎮 GameDin Validation Tool'));
    console.log(chalk.blue('========================='));
    
    // Run validations
    try {
      if (options.users) {
        await runValidation('Users', userMigration.validate, options);
      }
      
      if (options.products) {
        await runValidation('Products', productMigration.validate, options);
      }
      
      console.log(chalk.green('✅ Validation completed successfully!'));
    } catch (error) {
      console.error(chalk.red(`❌ Validation failed: ${error.message}`));
      console.error(error);
      process.exit(1);
    }
  });

async function runMigration(name, migrationFn, options) {
  const spinner = ora(`Migrating ${name}...`).start();
  try {
    const result = await migrationFn(options);
    spinner.succeed(`${name} migration complete: ${result.processed} processed, ${result.success} successful, ${result.errors} errors`);
    if (result.errors > 0) {
      console.log(chalk.yellow(`⚠️ There were ${result.errors} errors during ${name} migration. See logs for details.`));
    }
    return result;
  } catch (error) {
    spinner.fail(`${name} migration failed`);
    throw error;
  }
}

async function runValidation(name, validationFn, options) {
  const spinner = ora(`Validating ${name}...`).start();
  try {
    const result = await validationFn(options);
    spinner.succeed(`${name} validation complete: ${result.valid} valid, ${result.invalid} invalid`);
    if (result.invalid > 0) {
      console.log(chalk.yellow(`⚠️ Found ${result.invalid} invalid ${name.toLowerCase()} records. See logs for details.`));
    }
    return result;
  } catch (error) {
    spinner.fail(`${name} validation failed`);
    throw error;
  }
}

program.parse(); 