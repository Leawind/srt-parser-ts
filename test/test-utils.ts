import { StaticResourceManager } from '@leawind/inventory/static_resource';

export const SRM = StaticResourceManager.at(import.meta.dirname!, './resource');
