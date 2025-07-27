import { AgentsService } from '@/services/supabaseService';
import type { CreateAgentRequest } from '@/types/agent';

/**
 * Test function to verify Supabase integration for agent notes
 * This function creates a test agent with about and adminNotes fields,
 * then retrieves it to verify the data is properly saved and retrieved.
 */
export const testSupabaseAgentNotes = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Supabase agent notes integration...');

    // Test data with about and adminNotes fields
    const testAgentData: CreateAgentRequest = {
      name: 'Test Agent',
      identifier: 'test_agent_' + Date.now(),
      phoneNumber: '+33123456789',
      platform: 'whatsapp',
      category: 'electronics',
      about: 'This is a detailed about section for the test agent. It contains rich information about the agent\'s background and expertise.',
      adminNotes: 'These are private admin notes. Only administrators should see this information.',
      languages: ['Français', 'Anglais'],
      specialties: ['Test specialty'],
      contactInfo: {
        email: 'test@example.com'
      }
    };

    // Step 1: Create agent
    console.log('📝 Creating test agent...');
    const createdAgent = await AgentsService.create({
      name: testAgentData.name,
      identifier: testAgentData.identifier,
      phone_number: testAgentData.phoneNumber,
      platform: testAgentData.platform,
      category: testAgentData.category,
      specialties: testAgentData.specialties,
      status: 'active',
      description: testAgentData.about, // Map about to description
      admin_notes: testAgentData.adminNotes, // Map adminNotes to admin_notes
      languages: testAgentData.languages,
      email: testAgentData.contactInfo?.email
    });

    if (!createdAgent) {
      console.error('❌ Failed to create test agent');
      return false;
    }

    console.log('✅ Test agent created with ID:', createdAgent.id);

    // Step 2: Retrieve agent and verify data
    console.log('🔍 Retrieving test agent...');
    const retrievedAgent = await AgentsService.getById(createdAgent.id);

    if (!retrievedAgent) {
      console.error('❌ Failed to retrieve test agent');
      return false;
    }

    // Step 3: Verify about field (description in database)
    const aboutMatches = retrievedAgent.description === testAgentData.about;
    console.log('📖 About field test:', aboutMatches ? '✅ PASS' : '❌ FAIL');
    if (!aboutMatches) {
      console.log('   Expected:', testAgentData.about);
      console.log('   Got:', retrievedAgent.description);
    }

    // Step 4: Verify adminNotes field (admin_notes in database)
    const adminNotesMatches = retrievedAgent.admin_notes === testAgentData.adminNotes;
    console.log('🔒 Admin notes field test:', adminNotesMatches ? '✅ PASS' : '❌ FAIL');
    if (!adminNotesMatches) {
      console.log('   Expected:', testAgentData.adminNotes);
      console.log('   Got:', retrievedAgent.admin_notes);
    }

    // Step 5: Test update functionality
    console.log('🔄 Testing update functionality...');
    const updatedAbout = 'Updated about section with new information';
    const updatedAdminNotes = 'Updated admin notes with new private information';

    const updatedAgent = await AgentsService.update(createdAgent.id, {
      description: updatedAbout,
      admin_notes: updatedAdminNotes
    });

    if (!updatedAgent) {
      console.error('❌ Failed to update test agent');
      return false;
    }

    const updateAboutMatches = updatedAgent.description === updatedAbout;
    const updateAdminNotesMatches = updatedAgent.admin_notes === updatedAdminNotes;

    console.log('📝 Update about field test:', updateAboutMatches ? '✅ PASS' : '❌ FAIL');
    console.log('🔒 Update admin notes field test:', updateAdminNotesMatches ? '✅ PASS' : '❌ FAIL');

    // Step 6: Clean up - delete test agent
    console.log('🧹 Cleaning up test agent...');
    const deleted = await AgentsService.delete(createdAgent.id);
    console.log('🗑️ Test agent cleanup:', deleted ? '✅ PASS' : '❌ FAIL');

    // Step 7: Final result
    const allTestsPassed = aboutMatches && adminNotesMatches && updateAboutMatches && updateAdminNotesMatches && deleted;
    
    if (allTestsPassed) {
      console.log('🎉 All Supabase agent notes tests PASSED!');
      console.log('✅ The about and adminNotes fields are properly integrated with Supabase');
    } else {
      console.log('❌ Some Supabase agent notes tests FAILED');
      console.log('🔧 Please check the database schema and field mappings');
    }

    return allTestsPassed;

  } catch (error) {
    console.error('💥 Error during Supabase agent notes test:', error);
    return false;
  }
};

/**
 * Quick test to check if Supabase is properly configured
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔌 Testing Supabase connection...');
    const agents = await AgentsService.getAll();
    console.log('✅ Supabase connection successful:', agents.length, 'agents found');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    console.log('💡 Make sure your .env file has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    return false;
  }
};

// Export both functions for use in development
export default {
  testSupabaseAgentNotes,
  testSupabaseConnection
};