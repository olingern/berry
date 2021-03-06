import {posix} from 'path';

export default (concierge: any) => concierge

  .command(`entry [... args]`)
  .describe(`select whether to use install or run`)
  .flags({proxyArguments: true, defaultCommand: true, hiddenCommand: true})

  .action(async ({cwd, version, args, stdout, ... env}: any) => {
    let newCwd;

    // berry --version
    if (args.length === 1 && args[0] === `--version`) {
      stdout.write(`v2.0.0\n`);

    // berry --help
    } else if (args.length === 1 && (args[0] === `--help` || args[0] === `-h`)) {
      concierge.usage(env.argv0, {stream: stdout});
    
    // berry --frozen-lockfile
    } else if (args.length === 0 || args[0].charAt(0) === `-`) {
      return await concierge.run(null, [`install`, ... args], {cwd, stdout, ... env});
    
    // berry ~/projects/foo install
    } else if (args.length !== 0 && args[0].match(/[\\\/]/)) {
      return await concierge.run(null, args.slice(1), {cwd: posix.resolve(cwd, args[0]), stdout, ... env});
    
    // berry start
    } else {
      return await concierge.run(null, [`run`, ... args], {cwd, stdout, ... env});
    }
  });
