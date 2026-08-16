<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'name' => 'LMS-flask',
                'description' => 'Flask-based Learning Management System — ready product with instructor & admin dashboards.',
                'url' => 'https://github.com/Abhishek-e/LMS-flask',
                'language' => 'Python',
                'category' => 'python',
            ],
            [
                'name' => 'Resume-ATS-Tailor',
                'description' => 'Tool to tailor resumes so they pass Applicant Tracking Systems (ATS).',
                'url' => 'https://github.com/Abhishek-e/Resume-ATS-Tailor',
                'language' => 'HTML',
                'category' => 'web',
            ],
            [
                'name' => 'bot',
                'description' => 'Website chatbot built in Python.',
                'url' => 'https://github.com/Abhishek-e/bot',
                'language' => 'Python',
                'category' => 'python',
            ],
            [
                'name' => 'CRM',
                'description' => 'Client Resource Management system.',
                'url' => 'https://github.com/Abhishek-e/CRM',
                'language' => 'Python',
                'category' => 'python',
            ],
            [
                'name' => 'HMS',
                'description' => 'Management system project (HMS).',
                'url' => 'https://github.com/Abhishek-e/HMS',
                'language' => 'HTML',
                'category' => 'web',
            ],
            [
                'name' => 'illuminator',
                'description' => 'Company website — all information in one place.',
                'url' => 'https://github.com/Abhishek-e/illuminator',
                'language' => 'JavaScript',
                'category' => 'javascript',
            ],
            [
                'name' => 'DataLens-Analyzer',
                'description' => 'Data analysis & visualization tool.',
                'url' => 'https://github.com/Abhishek-e/DataLens-Analyzer',
                'language' => 'HTML',
                'category' => 'web',
            ],
            [
                'name' => 'Faculty-Research-Scrapper',
                'description' => 'Web scraper for collecting faculty research data.',
                'url' => 'https://github.com/Abhishek-e/Faculty-Research-Scrapper',
                'language' => 'Python',
                'category' => 'python',
            ],
            [
                'name' => 'ai-resume-agent',
                'description' => 'AI-powered agent for resume assistance.',
                'url' => 'https://github.com/Abhishek-e/ai-resume-agent',
                'language' => 'AI',
                'category' => 'other',
            ],
            [
                'name' => 'plag',
                'description' => 'Plagiarism-related utility/tool.',
                'url' => 'https://github.com/Abhishek-e/plag',
                'language' => 'JavaScript',
                'category' => 'javascript',
            ],
            [
                'name' => 'erp',
                'description' => 'Enterprise Resource Planning system.',
                'url' => 'https://github.com/Abhishek-e/erp',
                'language' => 'Project',
                'category' => 'other',
            ],
            [
                'name' => 'crime-detection',
                'description' => 'Detection of crime — data/ML driven project.',
                'url' => 'https://github.com/Abhishek-e/crime-detection',
                'language' => 'Project',
                'category' => 'other',
            ],
        ];

        foreach ($projects as $index => $project) {
            Project::create($project + ['sort_order' => $index]);
        }
    }
}
