import clear from 'clear';
// import clui from 'clui';
import homeMenu from 'menus/basicMenu';
import initializeServices from 'libs/initializeServices';
import {InitializedServicesType} from 'types';

async function startWork(services: InitializedServicesType): Promise<void> {
  await homeMenu(services);
}

async function init(): Promise<void> {
  clear();
  const initializedServices = await initializeServices().then((x) => x);

  await startWork(initializedServices);
  console.log('Exiting...');
}

init();
