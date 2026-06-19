import pandas as pd
import matplotlib.pyplot as plt
import os

file_path = os.path.join("analyze", "live-quiz-result.xlsx")

import numpy as np

def analyze_quiz_results():
    # Load data
    df = pd.read_excel(file_path, skiprows=4)
    
    # Extract percentage as 'Score'
    # Drop rows where 'Total Skor' might be NaN
    df = df.dropna(subset=['Total Skor'])
    df['Score'] = df['Total Skor'].astype(str).str.extract(r'\(([\d.]+)%\)').astype(float)
    df = df.dropna(subset=['Score'])
    
    # Calculate stats
    total_participants = len(df)
    average = df['Score'].mean()
    highest = df['Score'].max()
    lowest = df['Score'].min()
    
    # Group the scores
    bins = [-1, 50, 70, 80, 90, 101]
    labels = ['0 - 50', '50 - 70', '70 - 80', '80 - 90', '> 90']
    df['Score Group'] = pd.cut(df['Score'], bins=bins, labels=labels)
    
    # Count per group
    counts = df['Score Group'].value_counts().reindex(labels).fillna(0)
    
    # Plot settings
    bg_color = '#f8f9fa'
    text_color = '#2c3e50'
    colors = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6']
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 7), facecolor=bg_color)
    
    # Title
    fig.suptitle('Quiz Score Infographic\nProgramming Fundamentals', fontsize=20, fontweight='bold', color=text_color, y=0.98)
    
    # Subplot 1: Bar Chart
    ax1.set_facecolor(bg_color)
    bars = ax1.bar(labels, counts, color=colors, edgecolor='white', width=0.6)
    ax1.set_title('Number of Participants per Score Group', fontsize=14, fontweight='bold', pad=15)
    ax1.set_xlabel('Score Group', fontsize=12)
    ax1.set_ylabel('Number of Participants', fontsize=12)
    
    # Add text on top of bars
    for bar in bars:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2, yval + (counts.max()*0.02), int(yval), 
                 ha='center', va='bottom', fontsize=12, fontweight='bold', color=text_color)
                 
    # Grid and Spines for ax1
    ax1.grid(axis='y', linestyle='--', alpha=0.5, color='gray')
    ax1.set_axisbelow(True)
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)
    ax1.spines['left'].set_color('gray')
    ax1.spines['bottom'].set_color('gray')
    
    # Subplot 2: Pie Chart
    ax2.set_facecolor(bg_color)
    ax2.set_title('Percentage per Score Group', fontsize=14, fontweight='bold', pad=15)
    
    non_zero = counts > 0
    pie_counts = counts[non_zero]
    pie_labels = np.array(labels)[non_zero]
    pie_colors = np.array(colors)[non_zero]
    
    wedges, texts, autotexts = ax2.pie(
        pie_counts, 
        labels=pie_labels, 
        colors=pie_colors, 
        autopct='%1.1f%%',
        startangle=90, 
        explode=[0.05] * len(pie_counts),
        textprops={'fontsize': 10}
    )
    
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
        
    # Footer
    footer_text = f"Total Participants: {total_participants}  |  Average: {average:.1f}  |  Highest: {highest:.1f}  |  Lowest: {lowest:.1f}"
    fig.text(0.5, 0.02, footer_text, ha='center', fontsize=12, color='#555555')
    
    plt.tight_layout(rect=[0, 0.05, 1, 0.9])
    plt.show()

analyze_quiz_results()