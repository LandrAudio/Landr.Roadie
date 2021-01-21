import clear from 'clear';
// import clui from 'clui';
import homeMenu from 'menus/homeMenu';
import initializeApis from 'libs/initializeApis';
import {InitializedApisType} from 'types';

async function startWork(services: InitializedApisType): Promise<void> {
  await homeMenu(services);
}

async function init(): Promise<void> {
  clear();
  const initializedApis = await initializeApis().then((x) => x);

  await startWork(initializedApis);
  console.log('Exiting...');
}

init();
