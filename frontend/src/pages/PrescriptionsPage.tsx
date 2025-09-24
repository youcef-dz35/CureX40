import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrescriptionsPage() {
  const { t } = useTranslation(['pharmacy']);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('prescriptions.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('prescriptions.subtitle')}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400">
              Prescriptions page coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
