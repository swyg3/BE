import { join } from "path";

// 서버 프로젝트의 루트 폴더
// /Users/dkfjllasjdf/asdf/asdf/CF_SNS
export const PROJECT_ROOT_PATH = process.cwd();
// 외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_FOLDER_NAME = "public";
// 포스트 이미지들을 저장할 폴더 이름
export const PRODUCTS_FOLDER_NAME = "products";
// 임시 폴더 이름
export const TEMP_FOLDER_NAME = "temp";

// 실제 공개폴더의 절대경로
// /{프로젝트의 위치}/public
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

// 포스트 이미지를 저장할 폴더
// /{프로젝트의 위치}/public/posts
export const PRODUCTS_IMAGE_PATH = join(
  PUBLIC_FOLDER_PATH,
  PRODUCTS_FOLDER_NAME,
);

// 절대경로 x
// /public/posts/xxx.jpg
export const PRODUCTS_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  PRODUCTS_FOLDER_NAME,
);

// 임시 파일들을 저장할 폴더
// {프로젝트 경로}/temp
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, TEMP_FOLDER_NAME);
