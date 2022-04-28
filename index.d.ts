import cujs from './src/cujs';

declare module "chris-upload" {
  var cujs = new cujs();
  export default cujs;
}
